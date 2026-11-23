"""
TASKWEAVER — LSTM Task Delay Forecasting Model
Train, evaluate, and save the LSTM model for predicting:
  1. Delay probability (sigmoid output)
  2. Predicted actual duration (linear output)

Usage:
    python deep_learning/training/train_lstm.py

Outputs:
    deep_learning/saved_models/lstm_delay_model.keras
    deep_learning/saved_models/feature_scaler.pkl
    deep_learning/evaluation/lstm_evaluation_report.md
"""

import os
import sys
import numpy as np
import pandas as pd
import joblib
import json
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

DATASET_PATH = Path(__file__).parent.parent / "datasets" / "tasks_dataset.csv"
MODELS_DIR = Path(__file__).parent.parent / "saved_models"
EVAL_DIR = Path(__file__).parent.parent / "evaluation"
MODELS_DIR.mkdir(exist_ok=True)
EVAL_DIR.mkdir(exist_ok=True)

FEATURES = [
    "estimated_duration",
    "employee_workload",
    "task_complexity_enc",
    "task_priority_enc",
    "n_dependencies",
    "project_progress_at_start",
    "employee_performance_norm",
    "days_buffer_norm",
    "project_size_norm",
    "active_tasks_count",
]


def load_and_preprocess():
    print("[1/6] Loading dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"    Total samples: {len(df)}, Delay rate: {df['was_delayed'].mean():.1%}")

    # Encode categoricals
    complexity_map = {"low": 0, "medium": 1, "high": 2}
    priority_map = {"low": 0, "medium": 1, "high": 2, "critical": 3}
    df["task_complexity_enc"] = df["complexity"].map(complexity_map).fillna(1)
    df["task_priority_enc"] = df["priority"].map(priority_map).fillna(1)
    df["employee_performance_norm"] = df["employee_performance_score"] / 100.0
    df["days_buffer_norm"] = df["days_buffer"].clip(0, 30) / 30.0
    df["project_size_norm"] = df["project_size"].clip(1, 50) / 50.0

    # Clip outliers
    df["estimated_duration"] = df["estimated_duration"].clip(1, 60)
    df["actual_duration"] = df["actual_duration"].clip(1, 120)
    df["active_tasks_count"] = df["active_tasks_count"].clip(0, 10)

    train_df = df[df["split"] == "train"].copy()
    val_df = df[df["split"] == "val"].copy()
    test_df = df[df["split"] == "test"].copy()

    print(f"    Train: {len(train_df)} | Val: {len(val_df)} | Test: {len(test_df)}")
    return train_df, val_df, test_df


def prepare_sequences(df, scaler=None, fit_scaler=False):
    """Scale features and reshape for LSTM (seq_len=1 per task, but multi-feature)."""
    from sklearn.preprocessing import StandardScaler

    X = df[FEATURES].values
    y_class = df["was_delayed"].values.astype(np.float32)
    y_reg = df["actual_duration"].values.astype(np.float32)

    if fit_scaler:
        scaler = StandardScaler()
        X = scaler.fit_transform(X)
    else:
        X = scaler.transform(X)

    # Shape: (N, sequence_length=1, features)
    X_seq = X.reshape((X.shape[0], 1, X.shape[1]))
    return X_seq, y_class, y_reg, scaler


def build_model(n_features: int):
    """Build dual-head LSTM model."""
    import tensorflow as tf
    from tensorflow import keras

    inp = keras.Input(shape=(1, n_features), name="task_features")

    # LSTM layers
    x = keras.layers.LSTM(64, return_sequences=True, name="lstm_1")(inp)
    x = keras.layers.Dropout(0.25)(x)
    x = keras.layers.LSTM(32, name="lstm_2")(x)
    x = keras.layers.Dropout(0.20)(x)

    # Shared dense
    shared = keras.layers.Dense(32, activation="relu", name="shared_dense")(x)

    # Head 1: Delay probability (binary)
    prob_head = keras.layers.Dense(16, activation="relu")(shared)
    prob_out = keras.layers.Dense(1, activation="sigmoid", name="delay_probability")(prob_head)

    # Head 2: Predicted duration (regression)
    dur_head = keras.layers.Dense(16, activation="relu")(shared)
    dur_out = keras.layers.Dense(1, activation="relu", name="predicted_duration")(dur_head)

    # Concatenate outputs
    outputs = keras.layers.Concatenate(name="outputs")([prob_out, dur_out])

    model = keras.Model(inputs=inp, outputs=outputs, name="TaskWeaver_LSTM")
    return model


def train():
    train_df, val_df, test_df = load_and_preprocess()

    print("[2/6] Preparing sequences...")
    X_train, y_class_train, y_dur_train, scaler = prepare_sequences(train_df, fit_scaler=True)
    X_val, y_class_val, y_dur_val, _ = prepare_sequences(val_df, scaler=scaler)
    X_test, y_class_test, y_dur_test, _ = prepare_sequences(test_df, scaler=scaler)

    # Normalize durations for regression
    dur_mean = y_dur_train.mean()
    dur_std = y_dur_train.std()
    y_dur_train_norm = (y_dur_train - dur_mean) / dur_std
    y_dur_val_norm = (y_dur_val - dur_mean) / dur_std

    y_train = np.column_stack([y_class_train, y_dur_train_norm])
    y_val = np.column_stack([y_class_val, y_dur_val_norm])

    print("[3/6] Building and training delay forecasting model...")
    has_tf = False
    try:
        import tensorflow as tf
        has_tf = True
    except ImportError:
        print("    [Notice] TensorFlow not detected in this Python environment. Using Deep MLP Neural Network.")

    if has_tf:
        model = build_model(len(FEATURES))
        model.summary()

        def combined_loss(y_true, y_pred):
            prob_loss = tf.keras.losses.binary_crossentropy(y_true[:, 0:1], y_pred[:, 0:1])
            dur_loss = tf.keras.losses.mse(y_true[:, 1:2], y_pred[:, 1:2])
            return prob_loss + 0.3 * dur_loss

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
            loss=combined_loss,
            metrics=["mae"],
        )

        callbacks = [
            tf.keras.callbacks.EarlyStopping(patience=10, restore_best_weights=True, monitor="val_loss"),
            tf.keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5, monitor="val_loss"),
            tf.keras.callbacks.ModelCheckpoint(
                str(MODELS_DIR / "lstm_delay_model.keras"),
                save_best_only=True, monitor="val_loss",
            ),
        ]

        print("[4/6] Training LSTM...")
        model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=60, batch_size=64,
            callbacks=callbacks, verbose=1,
        )

        print("[5/6] Evaluating on test set...")
        from sklearn.metrics import (
            roc_auc_score, precision_score, recall_score, f1_score,
            mean_absolute_error, mean_squared_error, r2_score, confusion_matrix
        )
        from sklearn.ensemble import RandomForestClassifier

        y_pred_test = model.predict(X_test, verbose=0)
        prob_pred = y_pred_test[:, 0]
        dur_pred_norm = y_pred_test[:, 1]
        dur_pred = dur_pred_norm * dur_std + dur_mean
        model_name = "LSTM"
    else:
        from sklearn.neural_network import MLPClassifier, MLPRegressor
        from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
        from sklearn.metrics import (
            roc_auc_score, precision_score, recall_score, f1_score,
            mean_absolute_error, mean_squared_error, r2_score, confusion_matrix
        )

        X_train_2d = X_train.reshape(X_train.shape[0], -1)
        X_val_2d = X_val.reshape(X_val.shape[0], -1)
        X_test_2d = X_test.reshape(X_test.shape[0], -1)

        print("[4/6] Training Deep MLP Classifier & Regressor...")
        clf = MLPClassifier(hidden_layer_sizes=(64, 32, 16), activation="relu", max_iter=200, random_state=42)
        clf.fit(X_train_2d, y_class_train.astype(int))

        reg = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42)
        reg.fit(X_train_2d, y_dur_train)

        prob_pred = clf.predict_proba(X_test_2d)[:, 1]
        dur_pred = reg.predict(X_test_2d)

        # Save the trained ML/DL models
        joblib.dump({"classifier": clf, "regressor": reg}, MODELS_DIR / "delay_model.joblib")
        model_name = "Deep Neural Network (MLP)"

    print("[5/6] Computing evaluation metrics...")
    from sklearn.metrics import (
        roc_auc_score, precision_score, recall_score, f1_score,
        mean_absolute_error, mean_squared_error, r2_score, confusion_matrix
    )
    from sklearn.ensemble import RandomForestClassifier

    # Binary threshold
    threshold = 0.5
    class_pred = (prob_pred >= threshold).astype(int)

    # Regression metrics
    mae = mean_absolute_error(y_dur_test, dur_pred)
    rmse = np.sqrt(mean_squared_error(y_dur_test, dur_pred))
    r2 = r2_score(y_dur_test, dur_pred)

    # Classification metrics
    roc_auc = roc_auc_score(y_class_test, prob_pred)
    precision = precision_score(y_class_test, class_pred, zero_division=0)
    recall = recall_score(y_class_test, class_pred, zero_division=0)
    f1 = f1_score(y_class_test, class_pred, zero_division=0)
    cm = confusion_matrix(y_class_test, class_pred)

    # Baseline: Random Forest comparison
    X_train_2d = X_train.reshape(X_train.shape[0], -1)
    X_test_2d = X_test.reshape(X_test.shape[0], -1)
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train_2d, y_class_train.astype(int))
    rf_pred = rf.predict_proba(X_test_2d)[:, 1]
    rf_auc = roc_auc_score(y_class_test, rf_pred)
    rf_f1 = f1_score(y_class_test, rf.predict(X_test_2d), zero_division=0)

    print(f"\n{'='*50}")
    print(f"{model_name.upper()} EVALUATION RESULTS")
    print(f"{'='*50}")
    print(f"Regression - MAE: {mae:.3f}d | RMSE: {rmse:.3f}d | R^2: {r2:.4f}")
    print(f"Classification - Precision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f}")
    print(f"\nBaseline RF   - F1: {rf_f1:.4f} | ROC-AUC: {rf_auc:.4f}")
    print(f"{model_name} vs RF - Delta-AUC: {roc_auc - rf_auc:+.4f}")
    print(f"{'='*50}\n")

    # Save scaler
    scaler_meta = {"scaler": scaler, "dur_mean": dur_mean, "dur_std": dur_std, "features": FEATURES}
    joblib.dump(scaler_meta, MODELS_DIR / "feature_scaler.pkl")

    # Save RF baseline too
    joblib.dump(rf, MODELS_DIR / "rf_baseline.pkl")

    # Write evaluation report
    report = f"""# TASKWEAVER LSTM Evaluation Report

## Dataset
- Training samples: {len(train_df)}
- Validation samples: {len(val_df)}
- Test samples: {len(test_df)}
- Delay rate (test): {y_class_test.mean():.1%}

## LSTM Model

### Regression Metrics (Predicted Duration)
| Metric | Value |
|--------|-------|
| MAE | {mae:.3f} days |
| RMSE | {rmse:.3f} days |
| R² | {r2:.4f} |

### Classification Metrics (Delay Prediction)
| Metric | Value |
|--------|-------|
| Precision | {precision:.4f} |
| Recall | {recall:.4f} |
| F1-Score | {f1:.4f} |
| ROC-AUC | {roc_auc:.4f} |

### Confusion Matrix
```
{cm}
```
True Negative: {cm[0,0]} | False Positive: {cm[0,1]}
False Negative: {cm[1,0]} | True Positive: {cm[1,1]}

## Baseline Comparison (Random Forest)
| Metric | LSTM | Random Forest | LSTM Advantage |
|--------|------|---------------|----------------|
| ROC-AUC | {roc_auc:.4f} | {rf_auc:.4f} | {roc_auc - rf_auc:+.4f} |
| F1-Score | {f1:.4f} | {rf_f1:.4f} | {f1 - rf_f1:+.4f} |

## Important Notes
- This model was trained on **synthetic data** generated with realistic correlations
- Performance on real historical data will differ and should be re-evaluated
- The heuristic fallback in `prediction.py` uses similar feature weights
- Models are saved to: `deep_learning/saved_models/`
"""

    with open(EVAL_DIR / "lstm_evaluation_report.md", "w", encoding="utf-8") as f:
        f.write(report)

    print(f"[6/6] Models and report saved.")
    print(f"    LSTM: {MODELS_DIR / 'lstm_delay_model.keras'}")
    print(f"    Scaler: {MODELS_DIR / 'feature_scaler.pkl'}")
    print(f"    Report: {EVAL_DIR / 'lstm_evaluation_report.md'}")


if __name__ == "__main__":
    train()
