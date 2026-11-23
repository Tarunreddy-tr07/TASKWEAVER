import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.db import init_db
from app.api import auth, projects, tasks, predictions, simulation, dashboard, assistant

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Project Management Platform with Deep Learning",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://taskweaver-omega.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")


@app.on_event("startup")
async def startup():
    await init_db()
    await _seed_demo_data()


async def _seed_demo_data():
    """Insert demo user and sample data if DB is empty."""
    from app.database.db import AsyncSessionLocal
    from app.models.models import User, Employee, Project, Task
    from app.services.auth import hash_password
    from sqlalchemy import select
    import uuid

    async with AsyncSessionLocal() as db:
        # Check if demo user exists
        result = await db.execute(select(User).where(User.email == "demo@taskweaver.app"))
        if result.scalar_one_or_none():
            return  # Already seeded

        # Create demo user
        demo_user = User(
            id=str(uuid.uuid4()),
            name="Demo User",
            email="demo@taskweaver.app",
            hashed_password=hash_password("password123"),
            role="manager",
        )
        db.add(demo_user)

        # Create employees
        emp_data = [
            {"name": "Emily Chen", "email": "emily@tw.app", "department": "Engineering", "role": "Senior Frontend Dev", "performance_score": 94.0},
            {"name": "James Lee", "email": "james@tw.app", "department": "Engineering", "role": "Backend Engineer", "performance_score": 87.0},
            {"name": "Sarah Kim", "email": "sarah@tw.app", "department": "Engineering", "role": "Full Stack Dev", "performance_score": 81.0},
            {"name": "Tom Parker", "email": "tom@tw.app", "department": "Data", "role": "Data Engineer", "performance_score": 91.0},
            {"name": "Carol Davis", "email": "carol@tw.app", "department": "Architecture", "role": "Solutions Architect", "performance_score": 96.0},
        ]
        employees = []
        for e in emp_data:
            emp = Employee(id=str(uuid.uuid4()), **e)
            db.add(emp)
            employees.append(emp)

        await db.flush()

        # Create projects
        from datetime import datetime
        proj1 = Project(
            id=str(uuid.uuid4()),
            name="E-Commerce Platform Rebuild",
            description="Complete redesign of the customer-facing e-commerce platform.",
            status="active", priority="high", category="Web Development",
            manager_id=employees[0].id,
            start_date=datetime(2026, 9, 1),
            deadline=datetime(2026, 12, 1),
            completion_percentage=72.0,
        )
        db.add(proj1)
        await db.flush()

        # Create tasks
        tasks_data = [
            {"name": "User Authentication Module", "status": "completed", "priority": "high", "complexity": "medium", "estimated_duration": 7, "completion_percentage": 100.0, "assigned_to": employees[0].id, "delay_probability": 0.05},
            {"name": "Payment Gateway Integration", "status": "blocked", "priority": "critical", "complexity": "high", "estimated_duration": 10, "completion_percentage": 30.0, "assigned_to": employees[1].id, "delay_probability": 0.82},
            {"name": "Product Catalog API", "status": "in_progress", "priority": "high", "complexity": "medium", "estimated_duration": 8, "completion_percentage": 65.0, "assigned_to": employees[1].id, "delay_probability": 0.42},
        ]
        for td in tasks_data:
            task = Task(
                id=str(uuid.uuid4()),
                project_id=proj1.id,
                description="",
                start_date=datetime(2026, 10, 1),
                deadline=datetime(2026, 11, 30),
                prerequisite_tasks=[],
                **td,
            )
            db.add(task)

        await db.commit()
        print("[SEED] Demo data inserted successfully.")


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": "1.0.0"}
