"""
TASKWEAVER Dataset Generator
Generates realistic synthetic historical project data for training DL models.

Usage:
    python scripts/generate_dataset.py

Output:
    deep_learning/datasets/tasks_dataset.csv
    deep_learning/datasets/dependency_pairs.csv
    deep_learning/datasets/data_dictionary.md
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import random
import uuid
import os

random.seed(42)
np.random.seed(42)

# ─── Config ──────────────────────────────────────────────────────────────────
N_PROJECTS = 80       # Historical projects
N_EMPLOYEES = 30      # Team members
TASKS_PER_PROJECT_RANGE = (8, 45)
TRAIN_SPLIT = 0.70
VAL_SPLIT = 0.15
TEST_SPLIT = 0.15
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "../deep_learning/datasets")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Project categories and typical task types
CATEGORIES = ["Web Development", "Mobile", "Data Engineering", "Integration",
              "Analytics", "Infrastructure", "Security", "AI/ML"]

TASK_TYPES = {
    "Web Development": ["Frontend UI", "Backend API", "Authentication", "Payment Gateway",
                        "Search Engine", "Admin Dashboard", "Database Schema", "Testing"],
    "Mobile": ["iOS Development", "Android Development", "Push Notifications", "Offline Mode",
               "API Integration", "UI/UX Polish", "App Store Submission"],
    "Data Engineering": ["ETL Pipeline", "Data Warehouse", "Data Quality", "Analytics Dashboard",
                         "Report Generation", "Database Migration", "Index Optimization"],
    "Integration": ["API Integration", "Data Mapping", "Authentication Setup", "Error Handling",
                    "Testing", "Documentation", "Deployment"],
    "Analytics": ["Dashboard Design", "KPI Definition", "Data Collection", "Visualization",
                  "Alert Setup", "Performance Tuning"],
    "Infrastructure": ["CI/CD Pipeline", "Container Orchestration", "Monitoring Setup",
                       "Scaling Configuration", "Security Hardening", "Backup Setup"],
    "Security": ["Security Audit", "Penetration Testing", "Vulnerability Fix", "SSL Setup",
                 "Access Control", "Compliance Review"],
    "AI/ML": ["Data Collection", "Feature Engineering", "Model Training", "Model Evaluation",
              "API Deployment", "Monitoring", "Documentation"],
}

DEPARTMENTS = ["Engineering", "Data", "Infrastructure", "Architecture", "QA"]
COMPLEXITY_MAP = {"low": 0, "medium": 1, "high": 2}
PRIORITY_MAP = {"low": 0, "medium": 1, "high": 2, "critical": 3}


def generate_employees(n: int) -> list[dict]:
    names = [
        "Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Emily Chen",
        "Frank Miller", "Grace Lee", "Henry Brown", "Isabella Jones", "James Taylor",
        "Karen Anderson", "Liam Martinez", "Maria Garcia", "Nathan Thompson", "Olivia White",
        "Peter Harris", "Quinn Robinson", "Rachel Clark", "Samuel Lewis", "Tina Walker",
        "Uma Hall", "Victor Allen", "Wendy Young", "Xavier Hernandez", "Yara King",
        "Zachary Wright", "Amy Scott", "Brian Green", "Catherine Adams", "Derek Baker",
    ]
    employees = []
    for i in range(n):
        dept = random.choice(DEPARTMENTS)
        performance = np.random.beta(7, 2) * 30 + 70  # mostly 70–100
        employees.append({
            "employee_id": f"emp_{i:03d}",
            "name": names[i % len(names)],
            "department": dept,
            "performance_score": round(performance, 1),
            "capacity_hours": 40,
        })
    return employees


def generate_project(proj_id: int, employees: list) -> tuple[dict, list]:
    """Generate one project with its tasks, dependencies, and outcomes."""
    category = random.choice(CATEGORIES)
    n_tasks = random.randint(*TASKS_PER_PROJECT_RANGE)
    start = datetime(2024, 1, 1) + timedelta(days=random.randint(0, 500))
    planned_duration_days = random.randint(30, 180)
    deadline = start + timedelta(days=planned_duration_days)

    project = {
        "project_id": f"proj_{proj_id:04d}",
        "category": category,
        "n_tasks": n_tasks,
        "start_date": start,
        "deadline": deadline,
        "planned_duration_days": planned_duration_days,
        "team_size": random.randint(2, 8),
    }

    # Generate tasks with realistic patterns
    task_pool = TASK_TYPES.get(category, TASK_TYPES["Web Development"])
    tasks = []
    for t_idx in range(n_tasks):
        # Task characteristics
        priority = random.choices(["low", "medium", "high", "critical"], weights=[15, 40, 35, 10])[0]
        complexity = random.choices(["low", "medium", "high"], weights=[25, 50, 25])[0]
        employee = random.choice(employees)

        # Estimated duration based on complexity
        base_dur = {"low": 3, "medium": 6, "high": 12}[complexity]
        estimated_duration = max(1, int(np.random.lognormal(np.log(base_dur), 0.4)))

        task_start = start + timedelta(days=random.randint(0, planned_duration_days // 3))
        task_deadline = task_start + timedelta(days=estimated_duration + random.randint(0, 5))

        # Number of dependencies (affects delay)
        n_deps = random.choices([0, 1, 2, 3, 4], weights=[30, 30, 20, 15, 5])[0]
        n_deps = min(n_deps, t_idx)  # can't depend on future tasks

        # Employee workload (0..1) — simulated
        active_tasks = random.randint(1, 8)
        workload = min(0.98, active_tasks / 5.0)

        # REALISTIC delay model:
        # delay_prob is computed from features, not random
        workload_factor = workload * 0.30
        complexity_factor = {"low": 0.05, "medium": 0.15, "high": 0.30}[complexity]
        priority_factor = {"low": -0.05, "medium": 0.0, "high": 0.05, "critical": 0.08}[priority]
        dep_factor = min(n_deps, 4) * 0.04
        perf_factor = max(0, (0.85 - employee["performance_score"] / 100) * 0.25)
        days_buffer = max(0, (task_deadline - task_start).days - estimated_duration)
        urgency_factor = max(0.0, min(0.2, 1 / max(days_buffer + 1, 1) * 2))

        # Add noise
        noise = np.random.normal(0, 0.05)
        raw_prob = workload_factor + complexity_factor + priority_factor + dep_factor + perf_factor + urgency_factor + noise
        true_delay_prob = min(0.97, max(0.02, raw_prob))

        # Determine outcome
        delayed = np.random.random() < true_delay_prob
        if delayed:
            extra = max(1, int(np.random.exponential(estimated_duration * 0.4)))
            actual_duration = estimated_duration + extra
        else:
            variation = np.random.normal(0, estimated_duration * 0.1)
            actual_duration = max(1, int(estimated_duration + variation))

        status = "completed"  # Historical data — all completed

        tasks.append({
            "task_id": f"task_{proj_id:04d}_{t_idx:03d}",
            "project_id": project["project_id"],
            "task_name": random.choice(task_pool),
            "category": category,
            "priority": priority,
            "complexity": complexity,
            "assigned_employee_id": employee["employee_id"],
            "employee_performance_score": employee["performance_score"],
            "employee_workload": round(workload, 4),
            "active_tasks_count": active_tasks,
            "estimated_duration": estimated_duration,
            "actual_duration": actual_duration,
            "n_dependencies": n_deps,
            "task_index": t_idx,
            "project_size": n_tasks,
            "start_date": task_start,
            "deadline": task_deadline,
            "days_buffer": days_buffer,
            "project_progress_at_start": round(t_idx / n_tasks, 4),
            # Labels
            "was_delayed": int(delayed),
            "delay_days": max(0, actual_duration - estimated_duration),
            "true_delay_probability": round(true_delay_prob, 4),
            # For dependency model
            "task_type": random.choice(task_pool),
        })

    return project, tasks


def generate_dependency_pairs(all_tasks: list[dict]) -> list[dict]:
    """
    Generate labeled task pairs for dependency prediction.
    Positive: actual dependency (temporal + semantic).
    Negative: no dependency.
    """
    # Group tasks by project
    by_project: dict[str, list] = {}
    for t in all_tasks:
        by_project.setdefault(t["project_id"], []).append(t)

    pairs = []
    for proj_id, tasks in by_project.items():
        tasks_sorted = sorted(tasks, key=lambda x: x["task_index"])
        for i, t_a in enumerate(tasks_sorted):
            for j, t_b in enumerate(tasks_sorted):
                if i >= j:
                    continue
                # True dependency: consecutive task types in same project
                type_match = t_a["task_type"] in ["Backend API", "Authentication", "Database Schema"]
                temporal_order = j - i <= 3  # close in sequence
                is_dependency = int(type_match and temporal_order and random.random() < 0.6)

                # Feature: type similarity
                type_same = int(t_a["task_type"] == t_b["task_type"])
                cat_same = int(t_a["category"] == t_b["category"])
                idx_diff = j - i
                priority_diff = abs(PRIORITY_MAP.get(t_a["priority"], 1) - PRIORITY_MAP.get(t_b["priority"], 1))

                pairs.append({
                    "task_a_id": t_a["task_id"],
                    "task_b_id": t_b["task_id"],
                    "project_id": proj_id,
                    "task_a_type": t_a["task_type"],
                    "task_b_type": t_b["task_type"],
                    "task_a_priority_enc": PRIORITY_MAP.get(t_a["priority"], 1),
                    "task_b_priority_enc": PRIORITY_MAP.get(t_b["priority"], 1),
                    "task_a_complexity_enc": COMPLEXITY_MAP.get(t_a["complexity"], 1),
                    "task_b_complexity_enc": COMPLEXITY_MAP.get(t_b["complexity"], 1),
                    "index_difference": idx_diff,
                    "priority_difference": priority_diff,
                    "same_type": type_same,
                    "same_category": cat_same,
                    "has_dependency": is_dependency,
                })
                if len(pairs) > 50000:
                    break
            if len(pairs) > 50000:
                break

    # Balance classes
    pos = [p for p in pairs if p["has_dependency"] == 1]
    neg = [p for p in pairs if p["has_dependency"] == 0]
    n = min(len(pos), len(neg), 10000)
    balanced = random.sample(pos, n) + random.sample(neg, n)
    random.shuffle(balanced)
    return balanced


def main():
    print("[1/5] Generating employees...")
    employees = generate_employees(N_EMPLOYEES)
    emp_df = pd.DataFrame(employees)
    emp_df.to_csv(os.path.join(OUTPUT_DIR, "employees.csv"), index=False)

    print(f"[2/5] Generating {N_PROJECTS} projects and tasks...")
    all_tasks = []
    all_projects = []
    for i in range(N_PROJECTS):
        proj, tasks = generate_project(i, employees)
        all_projects.append(proj)
        all_tasks.extend(tasks)

    proj_df = pd.DataFrame(all_projects)
    proj_df.to_csv(os.path.join(OUTPUT_DIR, "projects.csv"), index=False)

    task_df = pd.DataFrame(all_tasks)

    # Train / val / test split — at project level to avoid data leakage
    proj_ids = proj_df["project_id"].tolist()
    random.shuffle(proj_ids)
    n = len(proj_ids)
    train_ids = set(proj_ids[:int(n * TRAIN_SPLIT)])
    val_ids = set(proj_ids[int(n * TRAIN_SPLIT):int(n * (TRAIN_SPLIT + VAL_SPLIT))])
    test_ids = set(proj_ids[int(n * (TRAIN_SPLIT + VAL_SPLIT)):])

    task_df["split"] = task_df["project_id"].apply(
        lambda p: "train" if p in train_ids else ("val" if p in val_ids else "test")
    )
    task_df.to_csv(os.path.join(OUTPUT_DIR, "tasks_dataset.csv"), index=False)

    print(f"   Total tasks: {len(task_df)}")
    print(f"   Train: {(task_df['split']=='train').sum()} | Val: {(task_df['split']=='val').sum()} | Test: {(task_df['split']=='test').sum()}")
    print(f"   Delay rate: {task_df['was_delayed'].mean():.1%}")

    print("[3/5] Generating dependency pairs...")
    dep_pairs = generate_dependency_pairs(all_tasks)
    dep_df = pd.DataFrame(dep_pairs)
    dep_df.to_csv(os.path.join(OUTPUT_DIR, "dependency_pairs.csv"), index=False)
    print(f"   Total pairs: {len(dep_df)} | Positive: {dep_df['has_dependency'].sum()}")

    print("[4/5] Writing data dictionary...")
    with open(os.path.join(OUTPUT_DIR, "data_dictionary.md"), "w") as f:
        f.write("""# TASKWEAVER Dataset Dictionary

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
""")

    print("[5/5] Summary:")
    print(f"   Projects: {len(all_projects)}")
    print(f"   Tasks: {len(all_tasks)}")
    print(f"   Dep pairs: {len(dep_pairs)}")
    print(f"   Saved to: {OUTPUT_DIR}")
    print("Done!")


if __name__ == "__main__":
    main()
