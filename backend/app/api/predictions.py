from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
import uuid
from datetime import datetime

from app.database.db import get_db
from app.models.models import Task, Employee, Project, Prediction, User
from app.schemas.schemas import PredictionOut
from app.services.auth import get_current_user
from app.services.prediction import prediction_service

router = APIRouter(prefix="/predictions", tags=["predictions"])


async def _build_task_features(task: Task, db: AsyncSession) -> dict:
    """Build feature dictionary for a given task."""
    # Employee workload
    workload = 0.7
    if task.assigned_to:
        count_result = await db.execute(
            select(func.count(Task.id)).where(
                Task.assigned_to == task.assigned_to,
                Task.status.in_(["in_progress", "not_started"])
            )
        )
        active_count = count_result.scalar() or 0
        workload = min(0.98, active_count / 5.0)

    # Employee performance
    perf = 0.85
    if task.assigned_to:
        emp_result = await db.execute(select(Employee).where(Employee.id == task.assigned_to))
        emp = emp_result.scalar_one_or_none()
        if emp:
            perf = (emp.performance_score or 80) / 100.0

    # Complexity
    comp_map = {"low": 0, "medium": 1, "high": 2}
    priority_map = {"low": 0, "medium": 1, "high": 2, "critical": 3}

    # Days remaining
    now = datetime.utcnow()
    deadline = task.deadline.replace(tzinfo=None) if task.deadline and task.deadline.tzinfo else (task.deadline or now)
    days_remaining = max(0, (deadline - now).days) if task.deadline else 14

    # Project progress
    proj_progress = 0.5
    if task.project:
        proj_progress = (task.project.completion_percentage or 0) / 100.0

    # Historical delay rate (simplified)
    hist_rate = 0.3

    return {
        "estimated_duration": task.estimated_duration or 5,
        "employee_workload": workload,
        "task_complexity": comp_map.get(str(task.complexity), 1),
        "priority": priority_map.get(str(task.priority), 1),
        "num_dependencies": len(task.prerequisite_tasks or []),
        "project_progress": proj_progress,
        "employee_performance": perf,
        "historical_delay_rate": hist_rate,
        "days_remaining": days_remaining,
        "completion_percentage": task.completion_percentage / 100.0,
        "expected_completion": (datetime.utcnow() - (task.start_date.replace(tzinfo=None) if task.start_date else datetime.utcnow())).days / max(1, (task.estimated_duration or 5)),
    }


@router.post("/task-delay/{task_id}")
async def predict_task_delay(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(Task).where(Task.id == task_id).options(
        selectinload(Task.project), selectinload(Task.assignee)
    )
    result = await db.execute(q)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")

    features = await _build_task_features(task, db)
    pred = prediction_service.predict_task_delay(features)
    importance = prediction_service.get_feature_importance(pred["delay_probability"], features)
    explanation = prediction_service.build_explanation(pred["delay_probability"], features, importance)
    risk = prediction_service.get_risk_level(pred["delay_probability"])

    # Save prediction
    prediction = Prediction(
        id=str(uuid.uuid4()),
        task_id=task_id,
        delay_probability=pred["delay_probability"],
        predicted_duration=pred["predicted_duration"],
        confidence_score=pred["confidence_score"],
        risk_level=risk,
        explanation=explanation,
        feature_importance=importance,
        model_version=pred.get("source", "heuristic"),
    )
    db.add(prediction)

    # Update task with prediction
    task.delay_probability = pred["delay_probability"]
    task.predicted_duration = pred["predicted_duration"]
    task.risk_level = risk

    await db.commit()
    await db.refresh(prediction)

    return {
        "task_id": task_id,
        "task_name": task.name,
        "delay_probability": pred["delay_probability"],
        "predicted_duration": pred["predicted_duration"],
        "estimated_duration": task.estimated_duration,
        "extra_days": max(0, pred["predicted_duration"] - (task.estimated_duration or 5)),
        "confidence_score": pred["confidence_score"],
        "risk_level": risk,
        "explanation": explanation,
        "feature_importance": importance,
    }


@router.post("/batch/{project_id}")
async def batch_predict_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.project_id == project_id, Task.status != "completed")
        .options(selectinload(Task.project), selectinload(Task.assignee))
    )
    tasks = result.scalars().all()

    results = []
    for task in tasks:
        features = await _build_task_features(task, db)
        pred = prediction_service.predict_task_delay(features)
        importance = prediction_service.get_feature_importance(pred["delay_probability"], features)
        risk = prediction_service.get_risk_level(pred["delay_probability"])
        task.delay_probability = pred["delay_probability"]
        task.predicted_duration = pred["predicted_duration"]
        task.risk_level = risk
        results.append({
            "task_id": task.id,
            "task_name": task.name,
            "delay_probability": pred["delay_probability"],
            "predicted_duration": pred["predicted_duration"],
            "risk_level": risk,
        })

    await db.commit()
    return {"project_id": project_id, "predictions": results, "count": len(results)}


@router.get("/project-completion/{project_id}")
async def get_project_completion_forecast(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.critical_path import critical_path_analyzer

    proj_result = await db.execute(select(Project).where(Project.id == project_id))
    proj = proj_result.scalar_one_or_none()
    if not proj:
        raise HTTPException(404, "Project not found")

    task_result = await db.execute(select(Task).where(Task.project_id == project_id))
    tasks = task_result.scalars().all()

    forecast = critical_path_analyzer.forecast_completion(tasks, proj.start_date)
    planned = proj.deadline
    predicted = forecast.get("predicted_completion_date")
    delay_days = max(0, (predicted - planned).days) if predicted and planned else 0

    return {
        "project_id": project_id,
        "project_name": proj.name,
        "planned_completion": planned,
        "predicted_completion": predicted,
        "delay_days": delay_days,
        "critical_path_tasks": forecast.get("critical_path_task_ids", []),
        "critical_path_length": forecast.get("critical_path_length", 0),
        "days_remaining": forecast.get("predicted_days_remaining", 0),
    }
