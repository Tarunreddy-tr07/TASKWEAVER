from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import Optional
from datetime import datetime

from app.database.db import get_db
from app.models.models import Project, Task, Employee, ProjectMember, User
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectOut, ProjectListResponse
from app.services.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


def _compute_task_stats(tasks):
    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == "completed")
    delayed = sum(1 for t in tasks if t.status in ("delayed", "blocked"))
    return total, completed, delayed


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(Project).options(
        selectinload(Project.tasks),
        selectinload(Project.manager),
        selectinload(Project.members)
    )
    if status:
        q = q.where(Project.status == status)
    if search:
        q = q.where(Project.name.ilike(f"%{search}%"))

    total_q = select(func.count()).select_from(q.subquery())
    total = (await db.execute(total_q)).scalar() or 0

    q = q.offset((page - 1) * page_size).limit(page_size).order_by(Project.created_at.desc())
    result = await db.execute(q)
    projects = result.scalars().all()

    items = []
    for p in projects:
        total_t, completed_t, delayed_t = _compute_task_stats(p.tasks)
        out = ProjectOut(
            id=p.id, name=p.name, description=p.description or "",
            status=p.status.value if hasattr(p.status, 'value') else p.status,
            priority=p.priority.value if hasattr(p.priority, 'value') else p.priority,
            category=p.category, manager_id=p.manager_id,
            manager_name=p.manager.name if p.manager else None,
            start_date=p.start_date, deadline=p.deadline,
            completion_percentage=p.completion_percentage,
            total_tasks=total_t, completed_tasks=completed_t, delayed_tasks=delayed_t,
            predicted_completion_date=p.predicted_completion_date,
            predicted_delay_days=p.predicted_delay_days or 0,
            risk_level=p.risk_level.value if p.risk_level and hasattr(p.risk_level, 'value') else p.risk_level,
            team_members=[m.employee_id for m in p.members] if hasattr(p, 'members') else [],
            created_at=p.created_at, updated_at=p.updated_at,
        )
        items.append(out)

    return ProjectListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=ProjectOut, status_code=201)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    proj = Project(
        name=data.name, description=data.description, status=data.status,
        priority=data.priority, category=data.category, manager_id=data.manager_id,
        start_date=datetime.fromisoformat(data.start_date) if data.start_date else None,
        deadline=datetime.fromisoformat(data.deadline) if data.deadline else None,
    )
    db.add(proj)
    await db.commit()
    await db.refresh(proj)
    return ProjectOut(
        id=proj.id, name=proj.name, description=proj.description or "",
        status=str(proj.status), priority=str(proj.priority), category=proj.category,
        manager_id=proj.manager_id, start_date=proj.start_date, deadline=proj.deadline,
        completion_percentage=0.0, total_tasks=0, completed_tasks=0, delayed_tasks=0,
        team_members=[], created_at=proj.created_at, updated_at=proj.updated_at,
    )


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = select(Project).where(Project.id == project_id).options(
        selectinload(Project.tasks), selectinload(Project.manager), selectinload(Project.members)
    )
    result = await db.execute(q)
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Project not found")

    total_t, completed_t, delayed_t = _compute_task_stats(p.tasks)
    return ProjectOut(
        id=p.id, name=p.name, description=p.description or "",
        status=str(p.status.value if hasattr(p.status, 'value') else p.status),
        priority=str(p.priority.value if hasattr(p.priority, 'value') else p.priority),
        category=p.category, manager_id=p.manager_id,
        manager_name=p.manager.name if p.manager else None,
        start_date=p.start_date, deadline=p.deadline,
        completion_percentage=p.completion_percentage,
        total_tasks=total_t, completed_tasks=completed_t, delayed_tasks=delayed_t,
        predicted_completion_date=p.predicted_completion_date,
        predicted_delay_days=p.predicted_delay_days or 0,
        risk_level=str(p.risk_level.value) if p.risk_level and hasattr(p.risk_level, 'value') else None,
        team_members=[m.employee_id for m in p.members],
        created_at=p.created_at, updated_at=p.updated_at,
    )


@router.put("/{project_id}", response_model=ProjectOut)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Project not found")

    for field, val in data.model_dump(exclude_none=True).items():
        if field == "deadline" and val:
            setattr(p, field, datetime.fromisoformat(val))
        else:
            setattr(p, field, val)

    await db.commit()
    await db.refresh(p)
    return await get_project(project_id, db, current_user)


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Project).where(Project.id == project_id))
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(404, "Project not found")
    await db.delete(p)
    await db.commit()
