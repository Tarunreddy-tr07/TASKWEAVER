# TASKWEAVER LSTM Evaluation Report

## Dataset
- Training samples: 1294
- Validation samples: 242
- Test samples: 365
- Delay rate (test): 66.3%

## LSTM Model

### Regression Metrics (Predicted Duration)
| Metric | Value |
|--------|-------|
| MAE | 1.971 days |
| RMSE | 3.516 days |
| R² | 0.7816 |

### Classification Metrics (Delay Prediction)
| Metric | Value |
|--------|-------|
| Precision | 0.7261 |
| Recall | 0.6901 |
| F1-Score | 0.7076 |
| ROC-AUC | 0.6150 |

### Confusion Matrix
```
[[ 60  63]
 [ 75 167]]
```
True Negative: 60 | False Positive: 63
False Negative: 75 | True Positive: 167

## Baseline Comparison (Random Forest)
| Metric | LSTM | Random Forest | LSTM Advantage |
|--------|------|---------------|----------------|
| ROC-AUC | 0.6150 | 0.6387 | -0.0237 |
| F1-Score | 0.7076 | 0.7724 | -0.0648 |

## Important Notes
- This model was trained on **synthetic data** generated with realistic correlations
- Performance on real historical data will differ and should be re-evaluated
- The heuristic fallback in `prediction.py` uses similar feature weights
- Models are saved to: `deep_learning/saved_models/`
