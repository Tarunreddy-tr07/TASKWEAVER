# TASKWEAVER Dataset Dictionary

## tasks_dataset.csv
| Column | Type | Description |
|--------|------|-------------|
| task_id | str | Unique task identifier |
| project_id | str | Parent project identifier |
| split | str | train / val / test (project-level split to avoid leakage) |
| estimated_duration | int | Planned task duration in days |
| actual_duration | int | Real observed duration (label) |
| was_delayed | int | 1 if actual > estimated (binary label) |
| delay_days | int | Extra days beyond estimate (regression label) |
| true_delay_probability | float | Computed delay probability from features |
| employee_workload | float | Fraction of capacity used (0–1) |
| employee_performance_score | float | Historical performance (0–100) |
| complexity | str | low / medium / high |
| priority | str | low / medium / high / critical |
| n_dependencies | int | Number of prerequisite tasks |
| days_buffer | int | Days between estimate and deadline |

## dependency_pairs.csv
| Column | Type | Description |
|--------|------|-------------|
| task_a_id | str | First task in pair |
| task_b_id | str | Second task in pair |
| has_dependency | int | 1 = dependency exists (binary label) |
| index_difference | int | Sequential index gap |
| same_type | int | 1 if same task type |
| priority_difference | int | Absolute priority difference |

## Notes
- Train/val/test split is at **project level** to prevent data leakage
- Delay probability is computed from features, not random
- This is synthetic data — performance on real data will differ
