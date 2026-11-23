"""
Prediction service — wraps trained LSTM model and dependency prediction model.
Falls back gracefully if models are not yet trained.
"""
import os
import numpy as np
import joblib
from typing import Optional, Dict, Any
from datetime import datetime

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../deep_learning/saved_models"))


class PredictionService:
    def __init__(self):
        self.lstm_model = None
        self.ml_model = None
        self.scaler = None
        self.dep_model = None
        self.dep_scaler = None
        self._loaded = False

    def _try_load(self):
        if self._loaded:
            return
        # 1. Try loading scaler
        scaler_path = os.path.join(MODEL_DIR, "feature_scaler.pkl")
        if os.path.exists(scaler_path):
            try:
                loaded_scaler = joblib.load(scaler_path)
                self.scaler = loaded_scaler.get("scaler", loaded_scaler) if isinstance(loaded_scaler, dict) else loaded_scaler
            except Exception as e:
                print(f"[PredictionService] Scaler load failed: {e}")

        # 2. Try loading LSTM Keras model
        try:
            import tensorflow as tf
            lstm_path = os.path.join(MODEL_DIR, "lstm_delay_model.keras")
            if os.path.exists(lstm_path):
                self.lstm_model = tf.keras.models.load_model(lstm_path)
        except Exception:
            pass

        # 3. Try loading Joblib Deep Neural Network / ML model
        joblib_path = os.path.join(MODEL_DIR, "delay_model.joblib")
        if os.path.exists(joblib_path):
            try:
                self.ml_model = joblib.load(joblib_path)
            except Exception as e:
                print(f"[PredictionService] ML model load failed: {e}")

        # 4. Try loading dependency model
        dep_path = os.path.join(MODEL_DIR, "dependency_model.joblib")
        dep_keras = os.path.join(MODEL_DIR, "dependency_model.keras")
        dep_scaler_path = os.path.join(MODEL_DIR, "dep_scaler.pkl")
        if os.path.exists(dep_scaler_path):
            try:
                d_scaler = joblib.load(dep_scaler_path)
                self.dep_scaler = d_scaler.get("scaler", d_scaler) if isinstance(d_scaler, dict) else d_scaler
            except Exception:
                pass
        if os.path.exists(dep_path):
            try:
                self.dep_model = joblib.load(dep_path)
            except Exception:
                pass
        elif os.path.exists(dep_keras):
            try:
                import tensorflow as tf
                self.dep_model = tf.keras.models.load_model(dep_keras)
            except Exception:
                pass

        self._loaded = True

    def predict_task_delay(self, task_features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predict delay probability and duration using LSTM/ML model.
        Returns prediction dict with probability, duration, confidence, feature importance.
        """
        self._try_load()

        if self.lstm_model and self.scaler:
            return self._lstm_predict(task_features)
        elif self.ml_model and self.scaler:
            return self._ml_predict(task_features)
        else:
            return self._heuristic_predict(task_features)

    def _ml_predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Use the trained Deep Neural Network (MLP) / GradientBoosting model."""
        try:
            feature_vector = np.array([[
                features.get("estimated_duration", 5),
                features.get("employee_workload", 0.7),
                features.get("task_complexity", 1),
                features.get("priority", 1),
                features.get("num_dependencies", 0),
                features.get("project_progress", 0.5),
                features.get("employee_performance", 0.85),
                min(features.get("days_remaining", 10), 30) / 30.0,
                min(features.get("project_size", 25), 50) / 50.0,
                min(features.get("active_tasks_count", 3), 10),
            ]])
            scaled = self.scaler.transform(feature_vector)
            clf = self.ml_model["classifier"]
            reg = self.ml_model["regressor"]
            delay_prob = float(clf.predict_proba(scaled)[0][1])
            pred_dur = float(reg.predict(scaled)[0])
            confidence = 1 - abs(delay_prob - 0.5) * 0.4
            return {
                "delay_probability": round(delay_prob, 4),
                "predicted_duration": max(1, int(round(pred_dur))),
                "confidence_score": round(confidence, 4),
                "source": "deep_mlp",
            }
        except Exception as e:
            print(f"[ML predict error]: {e}")
            return self._heuristic_predict(features)

    def _lstm_predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Use the trained LSTM model."""
        try:
            feature_vector = np.array([[
                features.get("estimated_duration", 5),
                features.get("employee_workload", 0.7),
                features.get("task_complexity", 1),   # 0=low,1=med,2=high
                features.get("priority", 1),           # 0=low,1=med,2=high,3=crit
                features.get("num_dependencies", 0),
                features.get("project_progress", 0.5),
                features.get("employee_performance", 0.85),
                min(features.get("days_remaining", 10), 30) / 30.0,
                min(features.get("project_size", 25), 50) / 50.0,
                min(features.get("active_tasks_count", 3), 10),
            ]])
            scaled = self.scaler.transform(feature_vector)
            seq_input = np.expand_dims(scaled, axis=1)  # (1, 1, n_features)
            output = self.lstm_model.predict(seq_input, verbose=0)
            delay_prob = float(output[0][0])
            pred_duration = float(output[0][1]) if output.shape[1] > 1 else features.get("estimated_duration", 5) * (1 + delay_prob)
            confidence = 1 - abs(delay_prob - 0.5) * 0.5
            return {
                "delay_probability": round(delay_prob, 4),
                "predicted_duration": max(1, int(round(pred_duration))),
                "confidence_score": round(confidence, 4),
                "source": "lstm",
            }
        except Exception as e:
            print(f"[LSTM predict error]: {e}")
            return self._heuristic_predict(features)

    def _heuristic_predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Rule-based heuristic fallback that uses real feature values.
        This is NOT random — it uses the actual task characteristics.
        """
        workload = features.get("employee_workload", 0.7)
        complexity_map = {"low": 0.1, "medium": 0.25, "high": 0.45}
        priority_map = {"low": -0.05, "medium": 0.0, "high": 0.05, "critical": 0.1}
        complexity_val = complexity_map.get(str(features.get("task_complexity", "medium")), 0.25)
        priority_val = priority_map.get(str(features.get("priority", "medium")), 0.0)
        deps = min(features.get("num_dependencies", 0), 5) * 0.04
        hist_delay = features.get("historical_delay_rate", 0.3)
        days_remaining = features.get("days_remaining", 10)
        urgency = max(0.0, min(0.3, 1 / max(days_remaining, 1) * 3))
        progress_deficit = max(0.0, features.get("expected_completion", 0.5) - features.get("completion_percentage", 0.0) / 100)

        raw_prob = (
            workload * 0.30
            + complexity_val * 0.25
            + hist_delay * 0.20
            + deps * 0.10
            + urgency * 0.10
            + priority_val * 0.05
        )
        delay_prob = min(0.97, max(0.02, raw_prob))
        est_dur = features.get("estimated_duration", 5)
        pred_duration = int(round(est_dur * (1 + delay_prob * 0.8)))
        confidence = 0.65  # Lower confidence for heuristic

        return {
            "delay_probability": round(delay_prob, 4),
            "predicted_duration": max(1, pred_duration),
            "confidence_score": confidence,
            "source": "heuristic",
        }

    def get_feature_importance(self, delay_prob: float, features: Dict[str, Any]) -> Dict[str, float]:
        """
        Compute approximate SHAP-style feature importance based on feature contributions.
        """
        workload = features.get("employee_workload", 0.7)
        complexity_map = {"low": 0.1, "medium": 0.25, "high": 0.45}
        complexity_val = complexity_map.get(str(features.get("task_complexity", "medium")), 0.25)
        hist_delay = features.get("historical_delay_rate", 0.3)
        days_remaining = features.get("days_remaining", 10)
        urgency = max(0.0, min(0.3, 1 / max(days_remaining, 1) * 3))

        raw = {
            "employee_workload": workload * 0.30,
            "task_complexity": complexity_val * 0.25,
            "historical_delay_rate": hist_delay * 0.20,
            "dependency_count": features.get("num_dependencies", 0) * 0.04,
            "deadline_urgency": urgency * 0.10,
        }
        total = sum(raw.values()) or 1
        return {k: round(v / total, 4) for k, v in raw.items()}

    def build_explanation(self, delay_prob: float, features: Dict[str, Any], importance: Dict[str, float]) -> str:
        parts = []
        workload = features.get("employee_workload", 0.7)
        if workload > 0.85:
            parts.append(f"Assigned employee is at {int(workload * 100)}% utilization (overloaded)")
        complexity = features.get("task_complexity", "medium")
        if str(complexity) == "high":
            parts.append("Task complexity is High, increasing inherent uncertainty")
        hist = features.get("historical_delay_rate", 0.3)
        if hist > 0.4:
            parts.append(f"Historical delay rate for similar tasks is {int(hist * 100)}%")
        deps = features.get("num_dependencies", 0)
        if deps > 2:
            parts.append(f"{deps} prerequisite tasks increase blocking risk")
        days = features.get("days_remaining", 10)
        if days < 7:
            parts.append(f"Only {days} days remaining before deadline")

        if not parts:
            parts.append("Multiple risk factors contribute to the predicted delay probability")

        top_factor = max(importance, key=importance.get)
        return (
            f"Primary driver ({int(importance[top_factor]*100)}%): {top_factor.replace('_', ' ').title()}. "
            + " · ".join(parts) + "."
        )

    def get_risk_level(self, prob: float) -> str:
        if prob <= 0.25:
            return "low"
        elif prob <= 0.50:
            return "moderate"
        elif prob <= 0.75:
            return "high"
        return "critical"


prediction_service = PredictionService()
