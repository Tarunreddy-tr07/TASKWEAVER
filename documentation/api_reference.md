# TASKWEAVER REST API Reference 📡

Production API: `https://taskweaver-backend-2026.onrender.com/api`

Local API: `http://localhost:8000/api`
Interactive OpenAPI Documentation: `http://localhost:8000/api/docs`

---

## 1. Authentication (`/api/auth`)

All secured endpoints require the standard Bearer header:  
`Authorization: Bearer <access_token>`

### `POST /auth/register`
Create a new user account.
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "password": "securepassword123",
  "role": "manager"
}
```
- **Response `201`**:
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@company.com",
    "role": "manager"
  }
}
```

### `POST /auth/login`
Authenticate existing user and obtain JWT token.
- **Request Body**:
```json
{
  "email": "demo@taskweaver.app",
  "password": "password123"
}
```

### `GET /auth/me`
Returns details of the currently authenticated user.

---

## 2. Projects (`/api/projects`)

### `GET /projects`
Retrieve all projects accessible to the user.
- **Query Params**: `status` (optional), `category` (optional)

### `POST /projects`
Create a new project.
- **Request Body**:
```json
{
  "name": "Cloud Migration",
  "description": "Migrate core microservices to Kubernetes",
  "status": "active",
  "priority": "high",
  "category": "Infrastructure",
  "manager_id": "emp_uuid",
  "start_date": "2026-11-01T00:00:00",
  "deadline": "2027-02-28T00:00:00"
}
```

### `GET /projects/{id}`
Get project details including team members and progress metrics.

### `PUT /projects/{id}`
Update an existing project's metadata or status.

### `DELETE /projects/{id}`
Delete a project and its associated task records.

---

## 3. Tasks (`/api/tasks`)

### `GET /tasks`
Retrieve tasks with optional filtering.
- **Query Params**: `project_id`, `assigned_to`, `status`, `priority`, `page`, `page_size`

### `POST /tasks`
Create a new task.
- **Request Body**:
```json
{
  "name": "Setup Redis Cluster",
  "description": "Deploy highly available Redis caching layer",
  "project_id": "proj_uuid",
  "assigned_to": "emp_uuid",
  "priority": "high",
  "status": "not_started",
  "complexity": "medium",
  "estimated_duration": 4,
  "start_date": "2026-11-05T00:00:00",
  "deadline": "2026-11-15T00:00:00",
  "prerequisite_tasks": ["task_uuid_1"]
}
```

### `PUT /tasks/{id}`
Update task progress, status, or assignment.

### `DELETE /tasks/{id}`
Delete a task.

---

## 4. AI Predictions (`/api/predictions`)

### `POST /predictions/task/{task_id}`
Generate deep learning delay prediction for an existing task.
- **Response**:
```json
{
  "task_id": "task_uuid",
  "delay_probability": 0.82,
  "predicted_duration": 14,
  "confidence_score": 0.85,
  "risk_level": "critical",
  "feature_importance": {
    "employee_workload": 0.35,
    "task_complexity": 0.28,
    "historical_delay_rate": 0.20,
    "dependency_count": 0.10,
    "deadline_urgency": 0.07
  },
  "explanation": "Primary driver (35%): Employee Workload. Assigned employee is at 88% utilization. 2 prerequisite tasks increase blocking risk."
}
```

### `POST /predictions/project/{project_id}/batch`
Trigger batch delay forecasting across all tasks in a project.

### `POST /predictions/predict-custom`
Ad-hoc prediction for what-if task features before creating the task.

---

## 5. What-If Simulation (`/api/simulation`)

### `POST /simulation/run`
Run CPM delay propagation simulation.
- **Request Body**:
```json
{
  "project_id": "proj_uuid",
  "task_id": "task_uuid",
  "additional_delay_days": 5
}
```
- **Response**:
```json
{
  "project_id": "proj_uuid",
  "task_id": "task_uuid",
  "additional_delay_days": 5,
  "original_completion_date": "2026-12-01",
  "simulated_completion_date": "2026-12-06",
  "total_project_delay": 5,
  "affected_tasks": [
    {
      "task_id": "task_uuid_2",
      "task_name": "API Integration",
      "delay_days": 5,
      "is_critical": true
    }
  ],
  "critical_path_changes": [
    "Critical path has changed due to this delay"
  ]
}
```

---

## 6. AI Assistant (`/api/assistant`)

### `POST /assistant/chat`
Query the TASKWEAVER AI assistant.
- **Request Body**:
```json
{
  "message": "Which tasks are at the highest risk of delaying the E-Commerce rebuild?"
}
```
- **Response**:
```json
{
  "response": "Based on live deep learning predictions, **Payment Gateway Integration** is at 82% delay risk (critical path) and **Product Catalog API** is at 42% risk...",
  "sources": ["Live database", "Deep Learning delay model"]
}
```
