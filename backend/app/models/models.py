from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from app.database.db import Base


def gen_uuid():
    return str(uuid.uuid4())


# ─── Enums ───────────────────────────────────────────────────────────────────

class ProjectStatus(str, enum.Enum):
    planning = "planning"
    active = "active"
    on_hold = "on_hold"
    completed = "completed"
    cancelled = "cancelled"


class TaskStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"
    blocked = "blocked"
    delayed = "delayed"


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Complexity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class UserRole(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    member = "member"


class RiskLevel(str, enum.Enum):
    low = "low"
    moderate = "moderate"
    high = "high"
    critical = "critical"


# ─── Models ──────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.member)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    department = Column(String(100))
    role = Column(String(100))
    skills = Column(JSON, default=list)
    performance_score = Column(Float, default=80.0)
    capacity_hours_per_week = Column(Integer, default=40)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assigned_to")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.planning)
    priority = Column(Enum(Priority), default=Priority.medium)
    category = Column(String(100))
    manager_id = Column(String, ForeignKey("employees.id"), nullable=True)
    start_date = Column(DateTime(timezone=True))
    deadline = Column(DateTime(timezone=True))
    completion_percentage = Column(Float, default=0.0)
    predicted_completion_date = Column(DateTime(timezone=True), nullable=True)
    predicted_delay_days = Column(Integer, default=0)
    risk_level = Column(Enum(RiskLevel), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    manager = relationship("Employee", foreign_keys=[manager_id])
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(String, primary_key=True, default=gen_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"))
    employee_id = Column(String, ForeignKey("employees.id"))
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="members")
    employee = relationship("Employee")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"))
    assigned_to = Column(String, ForeignKey("employees.id"), nullable=True)
    priority = Column(Enum(Priority), default=Priority.medium)
    status = Column(Enum(TaskStatus), default=TaskStatus.not_started)
    complexity = Column(Enum(Complexity), default=Complexity.medium)
    estimated_duration = Column(Integer)  # days
    actual_duration = Column(Integer, nullable=True)
    start_date = Column(DateTime(timezone=True))
    deadline = Column(DateTime(timezone=True))
    completion_percentage = Column(Float, default=0.0)
    prerequisite_tasks = Column(JSON, default=list)  # list of task IDs
    delay_probability = Column(Float, nullable=True)
    predicted_duration = Column(Integer, nullable=True)
    risk_level = Column(Enum(RiskLevel), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("Employee", back_populates="tasks", foreign_keys=[assigned_to])
    history = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")


class TaskDependency(Base):
    __tablename__ = "task_dependencies"

    id = Column(String, primary_key=True, default=gen_uuid)
    task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"))
    depends_on_task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"))
    dependency_type = Column(String(50), default="finish_to_start")
    is_predicted = Column(Boolean, default=False)
    confidence = Column(Float, nullable=True)
    approved = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TaskHistory(Base):
    __tablename__ = "task_history"

    id = Column(String, primary_key=True, default=gen_uuid)
    task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"))
    field_changed = Column(String(100))
    old_value = Column(Text)
    new_value = Column(Text)
    changed_by = Column(String, ForeignKey("users.id"), nullable=True)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

    task = relationship("Task", back_populates="history")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=gen_uuid)
    task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"))
    delay_probability = Column(Float)
    predicted_duration = Column(Integer)
    confidence_score = Column(Float)
    risk_level = Column(Enum(RiskLevel))
    explanation = Column(Text)
    feature_importance = Column(JSON)
    model_version = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(String, primary_key=True, default=gen_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"))
    task_id = Column(String, ForeignKey("tasks.id", ondelete="CASCADE"))
    additional_delay_days = Column(Integer)
    original_completion_date = Column(DateTime(timezone=True))
    simulated_completion_date = Column(DateTime(timezone=True))
    total_project_delay = Column(Integer)
    affected_tasks = Column(JSON)
    critical_path_changes = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    type = Column(String(50))
    title = Column(String(200))
    message = Column(Text)
    task_id = Column(String, nullable=True)
    project_id = Column(String, nullable=True)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
