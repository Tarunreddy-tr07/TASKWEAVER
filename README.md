# TASKWEAVER 🧵⚡

> **Predict Delays. Understand Dependencies. Deliver Smarter.**

An AI-powered project management platform combining traditional project management with Deep Learning-based task delay forecasting, intelligent dependency prediction, delay propagation analysis, and what-if simulation.

---

## 🏗️ Architecture

```
TaskWeaver/
├── frontend/          # React + TypeScript + Vite + Tailwind CSS
├── backend/           # FastAPI + SQLAlchemy + SQLite/PostgreSQL
├── deep_learning/
│   ├── datasets/      # Generated synthetic training data
│   ├── training/      # LSTM + Dependency model training scripts
│   ├── evaluation/    # Model evaluation reports
│   └── saved_models/  # Trained .keras model files
├── scripts/
│   └── generate_dataset.py  # Synthetic data generator
└── documentation/     # Architecture & API docs
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git

### 1. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 2. Backend

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/api/docs
```

### 3. Deep Learning Pipeline

```bash
# Install DL dependencies (same venv as backend)
pip install tensorflow scikit-learn pandas numpy networkx joblib

# Step 1: Generate synthetic dataset
python scripts/generate_dataset.py

# Step 2: Train LSTM delay forecasting model
python deep_learning/training/train_lstm.py

# Step 3: Train dependency prediction model
python deep_learning/training/train_dependency.py
```

### 4. Demo Login
```
Email:    demo@taskweaver.app
Password: password123
```

### 5. Environment Variables (optional)
Create `backend/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/taskweaver
```

---

## 🧠 AI Features

### Model 1: LSTM Task Delay Forecasting
- **Architecture**: 2-layer LSTM → dual output heads (classification + regression)
- **Outputs**: Delay probability + Predicted actual duration
- **Features**: Workload, complexity, priority, dependencies, performance history, deadline buffer
- **Evaluation**: MAE, RMSE, R², ROC-AUC, Precision, Recall, F1 vs Random Forest baseline

### Model 2: Task Dependency Prediction
- **Architecture**: 4-layer neural network binary classifier
- **Purpose**: Predicts whether a task pair likely has a dependency relationship
- **Important**: Suggestions require manager approval — not auto-applied

### Model 3: Project Completion Forecasting
- **Method**: NetworkX-based Critical Path Method (CPM)
- **Inputs**: Task dependency graph + predicted durations
- **Outputs**: Completion date, critical path, delay impact

### What-If Simulator
- Modifies dependency graph weights, recomputes CPM
- Does NOT simply add delay to final date

---

## 📊 Pages

| Page | Description |
|------|-------------|
| Landing | Animated dependency network, features overview |
| Dashboard | KPI cards, charts, risk alerts, activity feed |
| Projects | CRUD with risk indicators, progress tracking |
| Project Workspace | Kanban, Gantt, dependencies, AI predictions |
| Tasks | List/Kanban views with full CRUD |
| Dependency Intelligence | Interactive React Flow graph |
| AI Delay Forecasting | LSTM predictions with feature importance |
| Risk Analysis | Radar charts, per-project risk scoring |
| What-If Simulator | Scenario simulation with schedule impact |
| Workload Intelligence | Team utilization, overload detection |
| AI Insights | Chat interface with Groq API |
| Reports | Historical performance analytics |
| Settings | Profile, notifications, risk thresholds |

---

## ⚠️ Important Notes

- **Predictions are NOT random** — they use actual task features through the LSTM model or a feature-driven heuristic fallback
- **Dependencies require approval** — the AI never auto-creates task dependencies
- **Task reassignment requires manager approval** — workload system only suggests
- **Synthetic data performance** — model metrics are computed on synthetic data; real-world generalization requires retraining on historical data
- **Demo mode** — the frontend works in full demo mode even without the backend running

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts, Plotly.js |
| Graph | React Flow |
| Backend | FastAPI, SQLAlchemy 2.0, Pydantic |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Deep Learning | TensorFlow/Keras, LSTM |
| Graph Analysis | NetworkX |
| AI Assistant | Groq API (llama-3.3-70b) |
| Auth | JWT + bcrypt |

---

## 📜 License
MIT — TASKWEAVER © 2026
