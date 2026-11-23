from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import uuid
from datetime import datetime

from app.database.db import get_db
from app.models.models import Task, Project, SimulationResult, User
from app.schemas.schemas import SimulationRequest, SimulationResponse
from app.services.auth import get_current_user
from app.services.critical_path import critical_path_analyzer

router = APIRouter(prefix="/simulation", tags=["simulation"])


@router.post("/run")
async def run_simulation(
    data: SimulationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Load project
    proj_result = await db.execute(select(Project).where(Project.id == data.project_id))
    proj = proj_result.scalar_one_or_none()
    if not proj:
        raise HTTPException(404, "Project not found")

    # Load all tasks
    task_result = await db.execute(select(Task).where(Task.project_id == data.project_id))
    tasks = task_result.scalars().all()

    # Verify target task exists
    target_task = next((t for t in tasks if t.id == data.task_id), None)
    if not target_task:
        raise HTTPException(404, "Task not found in project")

    # Run simulation
    sim = critical_path_analyzer.simulate_delay(
        tasks=tasks,
        delayed_task_id=data.task_id,
        additional_days=data.additional_delay_days,
        project_start=proj.start_date,
    )

    original_forecast = critical_path_analyzer.forecast_completion(tasks, proj.start_date)
    planned = proj.deadline or datetime.utcnow()
    original_completion = (
        original_forecast.get("predicted_completion_date")
        or planned
    )
    sim_days = sim.get("total_delay", 0)
    simulated_completion = original_completion + __import__('datetime').timedelta(days=sim_days)

    affected_tasks = sim.get("affected_tasks", [])

    # Format for response
    affected_out = []
    for at in affected_tasks:
        task_obj = next((t for t in tasks if t.id == at["task_id"]), None)
        orig_end = (original_completion - __import__('datetime').timedelta(days=5)).strftime("%Y-%m-%d")
        new_end = (simulated_completion - __import__('datetime').timedelta(days=5)).strftime("%Y-%m-%d")
        affected_out.append({
            "task_id": at["task_id"],
            "task_name": at.get("task_name", ""),
            "original_end_date": orig_end,
            "new_end_date": new_end,
            "delay_days": at.get("delay_days", sim_days),
            "is_critical": at.get("is_critical", False),
        })

    critical_changes = []
    if sim.get("critical_path_changed"):
        critical_changes.append("Critical path has changed due to this delay")

    # Save result
    sim_result = SimulationResult(
        id=str(uuid.uuid4()),
        project_id=data.project_id,
        task_id=data.task_id,
        additional_delay_days=data.additional_delay_days,
        original_completion_date=original_completion,
        simulated_completion_date=simulated_completion,
        total_project_delay=sim_days,
        affected_tasks=affected_out,
        critical_path_changes=critical_changes,
    )
    db.add(sim_result)
    await db.commit()

    return {
        "id": sim_result.id,
        "project_id": data.project_id,
        "task_id": data.task_id,
        "task_name": target_task.name,
        "additional_delay_days": data.additional_delay_days,
        "original_completion_date": original_completion.strftime("%Y-%m-%d"),
        "simulated_completion_date": simulated_completion.strftime("%Y-%m-%d"),
        "total_project_delay": sim_days,
        "affected_tasks": affected_out,
        "critical_path_changes": critical_changes,
        "created_at": sim_result.created_at,
    }


@router.get("/results/{project_id}")
async def get_simulation_results(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SimulationResult)
        .where(SimulationResult.project_id == project_id)
        .order_by(SimulationResult.created_at.desc())
    )
    return result.scalars().all()
