from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime

from app.database.db import get_db
from app.models.models import Task, Project, User
from app.schemas.schemas import KPIResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpi", response_model=KPIResponse)
async def get_kpi(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_projects = (await db.execute(select(func.count(Project.id)))).scalar() or 0
    active_projects = (await db.execute(
        select(func.count(Project.id)).where(Project.status == "active")
    )).scalar() or 0
    completed_tasks = (await db.execute(
        select(func.count(Task.id)).where(Task.status == "completed")
    )).scalar() or 0
    delayed_tasks = (await db.execute(
        select(func.count(Task.id)).where(Task.status.in_(["delayed", "blocked"]))
    )).scalar() or 0
    high_risk_tasks = (await db.execute(
        select(func.count(Task.id)).where(Task.risk_level.in_(["high", "critical"]))
    )).scalar() or 0

    total_tasks = (await db.execute(select(func.count(Task.id)))).scalar() or 1
    on_time = max(0.0, 100 * (1 - delayed_tasks / total_tasks))

    return KPIResponse(
        total_projects=total_projects,
        active_projects=active_projects,
        completed_tasks=completed_tasks,
        delayed_tasks=delayed_tasks,
        high_risk_tasks=high_risk_tasks,
        on_time_completion_rate=round(on_time, 1),
    )


@router.get("/activity")
async def get_recent_activity(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Return latest task updates
    result = await db.execute(
        select(Task).order_by(Task.updated_at.desc()).limit(10)
    )
    tasks = result.scalars().all()
    activities = []
    for t in tasks:
        activities.append({
            "id": t.id,
            "type": "task_update",
            "text": f"Task '{t.name}' status: {t.status}",
            "time": str(t.updated_at or t.created_at),
        })
    return activities


@router.get("/risk-alerts")
async def get_risk_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task)
        .where(Task.delay_probability >= 0.5)
        .order_by(Task.delay_probability.desc())
        .limit(10)
    )
    tasks = result.scalars().all()
    return [
        {
            "id": t.id,
            "task": t.name,
            "project_id": t.project_id,
            "risk": round((t.delay_probability or 0) * 100),
            "deadline": str(t.deadline),
        }
        for t in tasks
    ]
