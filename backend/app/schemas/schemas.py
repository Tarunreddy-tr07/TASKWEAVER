from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field


# ─── Auth ─────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "member"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ─── Employee ─────────────────────────────────────────────────────────────

class EmployeeOut(BaseModel):
    id: str
    name: str
    email: str
    department: Optional[str]
    role: Optional[str]
    skills: List[str] = []
    performance_score: float
    capacity_hours_per_week: int

    class Config:
        from_attributes = True


# ─── Project ──────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    status: str = "planning"
    priority: str = "medium"
    category: Optional[str] = ""
    manager_id: Optional[str] = None
    start_date: Optional[str] = None
    deadline: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    deadline: Optional[str] = None
    completion_percentage: Optional[float] = None


class ProjectOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str
    priority: str
    category: Optional[str]
    manager_id: Optional[str]
    manager_name: Optional[str] = None
    start_date: Optional[datetime]
    deadline: Optional[datetime]
    completion_percentage: float
    total_tasks: int = 0
    completed_tasks: int = 0
    delayed_tasks: int = 0
    predicted_completion_date: Optional[datetime] = None
    predicted_delay_days: Optional[int] = 0
    risk_level: Optional[str] = None
    team_members: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    items: List[ProjectOut]
    total: int
    page: int
    page_size: int


# ─── Task ─────────────────────────────────────────────────────────────────

class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    project_id: str
    assigned_to: Optional[str] = None
    priority: str = "medium"
    status: str = "not_started"
    complexity: str = "medium"
    estimated_duration: int = 5
    start_date: Optional[str] = None
    deadline: Optional[str] = None
    completion_percentage: float = 0.0
    prerequisite_tasks: List[str] = []


class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    complexity: Optional[str] = None
    estimated_duration: Optional[int] = None
    actual_duration: Optional[int] = None
    deadline: Optional[str] = None
    completion_percentage: Optional[float] = None
    prerequisite_tasks: Optional[List[str]] = None


class TaskOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    project_id: str
    project_name: Optional[str] = None
    assigned_to: Optional[str]
    assigned_name: Optional[str] = None
    priority: str
    status: str
    complexity: str
    estimated_duration: Optional[int]
    actual_duration: Optional[int]
    start_date: Optional[datetime]
    deadline: Optional[datetime]
    completion_percentage: float
    prerequisite_tasks: List[str] = []
    delay_probability: Optional[float] = None
    predicted_duration: Optional[int] = None
    risk_level: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Predictions ──────────────────────────────────────────────────────────

class PredictionOut(BaseModel):
    id: str
    task_id: str
    task_name: Optional[str] = None
    delay_probability: float
    predicted_duration: int
    confidence_score: float
    risk_level: str
    explanation: str
    feature_importance: dict
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Simulation ───────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    project_id: str
    task_id: str
    additional_delay_days: int = Field(ge=1, le=90)
    employee_reallocation: Optional[dict] = None


class AffectedTask(BaseModel):
    task_id: str
    task_name: str
    original_end_date: str
    new_end_date: str
    delay_days: int
    is_critical: bool


class SimulationResponse(BaseModel):
    id: str
    project_id: str
    task_id: str
    additional_delay_days: int
    original_completion_date: str
    simulated_completion_date: str
    total_project_delay: int
    affected_tasks: List[AffectedTask]
    critical_path_changes: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard ────────────────────────────────────────────────────────────

class KPIResponse(BaseModel):
    total_projects: int
    active_projects: int
    completed_tasks: int
    delayed_tasks: int
    high_risk_tasks: int
    on_time_completion_rate: float


# ─── Assistant ────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[str] = []
