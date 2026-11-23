from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime

from app.database.db import get_db
from app.models.models import Task, Project, Employee, TaskHistory, User
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


async def _task_to_out(task: Task) -> TaskOut:
    return TaskOut(
        id=task.id, name=task.name, description=task.description or "",
        project_id=task.project_id,
        project_name=task.project.name if task.project else None,
        assigned_to=task.assigned_to,
        assigned_name=task.assignee.name if task.assignee else None,
        priority=str(task.priority.value if hasattr(task.priority, 'value') else task.priority),
        status=str(task.status.value if hasattr(task.status, 'value') else task.status),
        complexity=str(task.complexity.value if hasattr(task.complexity, 'value') else task.complexity),
        estimated_duration=task.estimated_duration, actual_duration=task.actual_duration,
        start_date=task.start_date, deadline=task.deadline,
        completion_percentage=task.completion_percentage,
        prerequisite_tasks=task.prerequisite_tasks or [],
        delay_probability=task.delay_probability,
        predicted_duration=task.predicted_duration,
        risk_level=str(task.risk_level.value) if task.risk_level and hasattr(task.risk_level, 'value') else None,
        created_at=task.created_at, updated_at=task.updated_at,
    )


@router.get("")
async def list_tasks(
    project_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(Task).options(selectinload(Task.project), selectinload(Task.assignee))
    if project_id:
        q = q.where(Task.project_id == project_id)
    if assigned_to:
        q = q.where(Task.assigned_to == assigned_to)
    if status:
        q = q.where(Task.status == status)
    if priority:
        q = q.where(Task.priority == priority)
    q = q.offset((page - 1) * page_size).limit(page_size).order_by(Task.created_at.desc())
    result = await db.execute(q)
    tasks = result.scalars().all()
    return [await _task_to_out(t) for t in tasks]


@router.post("", status_code=201)
async def create_task(
    data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        name=data.name, description=data.description, project_id=data.project_id,
        assigned_to=data.assigned_to, priority=data.priority, status=data.status,
        complexity=data.complexity, estimated_duration=data.estimated_duration,
        start_date=datetime.fromisoformat(data.start_date) if data.start_date else None,
        deadline=datetime.fromisoformat(data.deadline) if data.deadline else None,
        completion_percentage=data.completion_percentage,
        prerequisite_tasks=data.prerequisite_tasks,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Reload with relationships
    q = select(Task).where(Task.id == task.id).options(selectinload(Task.project), selectinload(Task.assignee))
    result = await db.execute(q)
    task = result.scalar_one()
    return await _task_to_out(task)


@router.get("/{task_id}")
async def get_task(task_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    q = select(Task).where(Task.id == task_id).options(selectinload(Task.project), selectinload(Task.assignee))
    result = await db.execute(q)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    return await _task_to_out(task)


@router.put("/{task_id}")
async def update_task(
    task_id: str,
    data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(Task).where(Task.id == task_id).options(selectinload(Task.project), selectinload(Task.assignee))
    result = await db.execute(q)
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")

    for field, val in data.model_dump(exclude_none=True).items():
        if field == "deadline" and val:
            setattr(task, field, datetime.fromisoformat(val))
        else:
            setattr(task, field, val)

    await db.commit()
    await db.refresh(task)
    return await _task_to_out(task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(404, "Task not found")
    await db.delete(task)
    await db.commit()


@router.get("/{task_id}/history")
async def get_task_history(task_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(TaskHistory).where(TaskHistory.task_id == task_id).order_by(TaskHistory.changed_at.desc())
    )
    return result.scalars().all()
