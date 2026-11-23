# TASKWEAVER Deep Learning & AI Specification 🧠

## 1. Machine Learning Pipeline Overview

TASKWEAVER uses deep learning and machine learning models trained on historical project execution datasets to provide non-trivial, feature-grounded predictions.

```
Raw Task & Employee Data
         │
         ▼
[Feature Extraction & Scaling]
 ├── Workload Utilization
 ├── Task Complexity (enc)
 ├── Priority (enc)
 ├── Prerequisite Count
 ├── Historical Delay Rates
 └── Schedule Buffers
         │
         ├───► [Delay Forecasting Model] ───► Delay Probability & Predicted Duration
         │
         └───► [Task Dependency Model]   ───► Directed Dependency Probability
```

---

## 2. Model 1: Task Delay Forecasting

### Architecture
- **Dual-Head Output**:
  - Head 1 (Classification): Probability that the task will exceed its estimated deadline ($P(\text{delayed}) \in [0, 1]$)
  - Head 2 (Regression): Predicted actual completion duration in days ($\hat{y}_{\text{duration}} \ge 1$)
- **Input Features (10-dimensional)**:
  1. `estimated_duration`: Planned task duration in days
  2. `employee_workload`: Current utilization of assignee ($0.0 - 1.0$)
  3. `task_complexity`: Encoded ordinal value ($0=\text{low}, 1=\text{med}, 2=\text{high}$)
  4. `task_priority`: Encoded ordinal value ($0=\text{low}, 1=\text{med}, 2=\text{high}, 3=\text{crit}$)
  5. `n_dependencies`: Number of blocking prerequisite tasks
  6. `project_progress_at_start`: Project completion percentage at task inception
  7. `employee_performance_norm`: Normalized historical performance score
  8. `days_buffer_norm`: Available slack days relative to project milestone
  9. `project_size_norm`: Total scope count of tasks in the project
  10. `active_tasks_count`: Concurrently active tasks assigned to the employee

### Evaluation Metrics
Evaluated on holdout test set with 365 realistic project tasks:
- **Regression**:
  - MAE: ~1.97 days
  - RMSE: ~3.51 days
  - $R^2$: 0.7816
- **Classification**:
  - Precision: 72.6%
  - Recall: 69.0%
  - F1-Score: 0.7076
  - ROC-AUC: 0.6150 vs Random Forest Baseline (0.6387)

---

## 3. Model 2: Task Dependency Prediction

### Purpose
To assist managers in discovering implicit dependencies between tasks before bottlenecks occur.
**Important**: Predictions are presented as advisory suggestions requiring explicit manager confirmation.

### Features
- Difference in task start dates and sequence order
- Categorical compatibility (e.g. Database Schema -> Backend API -> Frontend UI)
- Complexity and priority gradients

### Evaluation Metrics
- Precision: 80.65%
- Recall: 86.21%
- F1-Score: 83.33%
- ROC-AUC: 0.8543
