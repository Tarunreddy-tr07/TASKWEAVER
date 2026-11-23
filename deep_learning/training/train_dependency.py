"""
TASKWEAVER — Task Dependency Prediction Model
Neural network binary classifier: does task_a depend on task_b?

Usage:
    python deep_learning/training/train_dependency.py

Outputs:
    deep_learning/saved_models/dependency_model.keras
    deep_learning/evaluation/dependency_evaluation_report.md
"""
import os
import sys
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

DATASET_PATH = Path(__file__).parent.parent / "datasets" / "dependency_pairs.csv"
MODELS_DIR = Path(__file__).parent.parent / "saved_models"
EVAL_DIR = Path(__file__).parent.parent / "evaluation"
MODELS_DIR.mkdir(exist_ok=True)
EVAL_DIR.mkdir(exist_ok=True)

DEP_FEATURES = [
    "task_a_priority_enc",
    "task_b_priority_enc",
    "task_a_complexity_enc",
    "task_b_complexity_enc",
    "index_difference",
    "priority_difference",
    "same_type",
    "same_category",
]


def train_dependency_model():
    print("[1/5] Loading dependency dataset...")
    df = pd.read_csv(DATASET_PATH)
    print(f"    Total pairs: {len(df)} | Positive rate: {df['has_dependency'].mean():.1%}")

    # Features
    X = df[DEP_FEATURES].values.astype(np.float32)
    y = df["has_dependency"].values.astype(np.float32)

    # Simple split (random since pairs are from different projects)
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    X_train, X_val, y_train, y_val = train_test_split(X_train, y_train, test_size=0.15, random_state=42)

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_val = scaler.transform(X_val)
    X_test = scaler.transform(X_test)

    print(f"    Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

    print("[2/5] Building dependency prediction model...")
    has_tf = False
    try:
        import tensorflow as tf
        from tensorflow import keras
        has_tf = True
    except ImportError:
        print("    [Notice] TensorFlow not detected in this Python environment. Using Deep MLP Neural Network.")

    if has_tf:
        model = keras.Sequential([
            keras.layers.Input(shape=(len(DEP_FEATURES),), name="dep_features"),
            keras.layers.Dense(64, activation="relu"),
            keras.layers.BatchNormalization(),
            keras.layers.Dropout(0.3),
            keras.layers.Dense(32, activation="relu"),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(16, activation="relu"),
            keras.layers.Dense(1, activation="sigmoid", name="dependency_probability"),
        ], name="TaskWeaver_DependencyNet")

        model.compile(
            optimizer=keras.optimizers.Adam(1e-3),
            loss="binary_crossentropy",
            metrics=["accuracy", keras.metrics.AUC(name="auc")],
        )
        model.summary()

        print("[3/5] Training...")
        callbacks = [
            keras.callbacks.EarlyStopping(patience=8, restore_best_weights=True),
            keras.callbacks.ModelCheckpoint(
                str(MODELS_DIR / "dependency_model.keras"),
                save_best_only=True, monitor="val_auc", mode="max",
            ),
        ]
        model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=40, batch_size=128,
            callbacks=callbacks, verbose=1,
        )

        prob_pred = model.predict(X_test, verbose=0).flatten()
    else:
        from sklearn.neural_network import MLPClassifier
        print("[3/5] Training Deep MLP Classifier for dependency prediction...")
        clf = MLPClassifier(hidden_layer_sizes=(64, 32, 16), activation="relu", max_iter=300, random_state=42)
        clf.fit(X_train, y_train.astype(int))

        joblib.dump(clf, MODELS_DIR / "dependency_model.joblib")
        prob_pred = clf.predict_proba(X_test)[:, 1]

    print("[4/5] Evaluating...")
    from sklearn.metrics import (
        precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
    )
    class_pred = (prob_pred >= 0.5).astype(int)

    precision = precision_score(y_test, class_pred, zero_division=0)
    recall = recall_score(y_test, class_pred, zero_division=0)
    f1 = f1_score(y_test, class_pred, zero_division=0)
    auc = roc_auc_score(y_test, prob_pred)
    cm = confusion_matrix(y_test, class_pred)

    print(f"\nPrecision: {precision:.4f} | Recall: {recall:.4f} | F1: {f1:.4f} | AUC: {auc:.4f}")
    print(f"Confusion Matrix:\n{cm}")

    # Save scaler
    joblib.dump({"scaler": scaler, "features": DEP_FEATURES}, MODELS_DIR / "dep_scaler.pkl")

    report = f"""# Dependency Prediction Model Evaluation

## Dataset
- Total pairs: {len(df)}
- Positive (dependency): {int(df['has_dependency'].sum())}
- Negative (no dependency): {int((df['has_dependency'] == 0).sum())}
- Test set size: {len(X_test)}

## Metrics
| Metric | Value |
|--------|-------|
| Precision | {precision:.4f} |
| Recall | {recall:.4f} |
| F1-Score | {f1:.4f} |
| ROC-AUC | {auc:.4f} |

## Confusion Matrix
```
TN: {cm[0,0]}  FP: {cm[0,1]}
FN: {cm[1,0]}  TP: {cm[1,1]}
```

## Important Notes
- Predicted dependencies are suggestions only — manager approval required
- Temporal ordering alone is NOT used as proof of dependency
- Model uses semantic task type similarity — ordering patterns
"""
    with open(EVAL_DIR / "dependency_evaluation_report.md", "w", encoding="utf-8") as f:
        f.write(report)

    saved_name = "dependency_model.keras" if has_tf else "dependency_model.joblib"
    print(f"[5/5] Saved: {MODELS_DIR / saved_name}")


if __name__ == "__main__":
    train_dependency_model()
