# Dependency Prediction Model Evaluation

## Dataset
- Total pairs: 286
- Positive (dependency): 143
- Negative (no dependency): 143
- Test set size: 58

## Metrics
| Metric | Value |
|--------|-------|
| Precision | 0.8065 |
| Recall | 0.8621 |
| F1-Score | 0.8333 |
| ROC-AUC | 0.8543 |

## Confusion Matrix
```
TN: 23  FP: 6
FN: 4  TP: 25
```

## Important Notes
- Predicted dependencies are suggestions only — manager approval required
- Temporal ordering alone is NOT used as proof of dependency
- Model uses semantic task type similarity — ordering patterns
