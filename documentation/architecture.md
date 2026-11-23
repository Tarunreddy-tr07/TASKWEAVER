# TASKWEAVER Architecture Documentation 🧵⚡

## 1. System Overview

**TASKWEAVER** is an AI-powered project management platform that combines traditional agile/waterfall project management with Deep Learning-based task delay forecasting, intelligent dependency prediction, cascading delay propagation analysis, and What-If schedule simulation.

```
                               ┌─────────────────────────────────────────┐
                               │           TASKWEAVER Frontend           │
                               │  React 18 + Vite + Tailwind CSS v4      │
                               │  Framer Motion + React Flow + Recharts  │
                               └────────────────────┬────────────────────┘
                                                    │
                                         HTTP / REST (JWT Auth)
                                                    │
                               ┌────────────────────▼────────────────────┐
                               │           TASKWEAVER Backend            │
                               │       FastAPI + Pydantic v2             │
                               │      SQLAlchemy 2.0 (Async)             │
                               └──────────┬───────────────────┬──────────┘
                                          │                   │
                     ┌────────────────────▼─────┐       ┌─────▼────────────────────┐
                     │     Database Layer       │       │    AI & ML Engine        │
                     │  SQLite (Async aiosqlite)│       │  Deep MLP / LSTM Models  │
                     │  / PostgreSQL (asyncpg)  │       │  NetworkX CPM Simulator  │
                     └──────────────────────────┘       │  Groq LLM Assistant      │
                                                        └──────────────────────────┘
```

---

## 2. Directory Structure

```
TaskWeaver/
├── frontend/                     # React 18 SPA
│   ├── src/
│   │   ├── components/ui/        # Reusable UI components (Card, Button, Badge, etc.)
│   │   ├── context/              # Authentication & Global Context
│   │   ├── layouts/              # AppLayout, Sidebar, Navbar
│   │   ├── pages/                # 13 Application Pages
│   │   │   ├── LandingPage.tsx   # Marketing & feature showcase
│   │   │   ├── dashboard/        # KPI analytics & recent activity
│   │   │   ├── projects/         # Project CRUD & Gantt/Kanban Workspace
│   │   │   ├── tasks/            # Task management & filtering
│   │   │   ├── dependency/       # Interactive React Flow DAG graph
│   │   │   ├── forecasting/      # Delay predictions & SHAP feature importances
│   │   │   ├── risk/             # Radar charts & project risk scores
│   │   │   ├── simulator/        # What-If scenario sandbox
│   │   │   ├── workload/         # Developer capacity & rebalancing
│   │   │   ├── insights/         # Groq LLM-powered conversational agent
│   │   │   ├── reports/          # Historical delivery analytics
│   │   │   └── settings/         # User profile & thresholds
│   │   ├── services/             # Axios API client modules
│   │   ├── types/                # TypeScript interface definitions
│   │   └── utils/                # Design tokens, color helpers, formatters
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # FastAPI asynchronous application
│   ├── app/
│   │   ├── api/                  # API routers (auth, projects, tasks, predictions, simulation, etc.)
│   │   ├── database/             # Async SQLAlchemy engine & session factory
│   │   ├── models/               # SQLAlchemy ORM models (User, Project, Task, etc.)
│   │   ├── schemas/              # Pydantic v2 validation models
│   │   ├── services/             # Prediction service, CPM analyzer, Auth
│   │   ├── config.py             # Settings via pydantic-settings
│   │   └── main.py               # FastAPI initialization & demo seeder
│   └── requirements.txt
├── deep_learning/                # Machine learning pipeline
│   ├── datasets/                 # tasks_dataset.csv, dependency_pairs.csv
│   ├── saved_models/             # delay_model.joblib, dependency_model.joblib, scalers
│   ├── evaluation/               # Model evaluation benchmarks & confusion matrices
│   └── training/                 # train_lstm.py, train_dependency.py
├── simulation/                   # Schedule simulation engine
│   ├── cpm_engine.py             # NetworkX-based Critical Path Method & float analyzer
│   ├── monte_carlo.py            # Beta-PERT probabilistic Monte Carlo simulator
│   ├── what_if_simulator.py      # Delay injection, crashing, & scope creep engine
│   └── run_simulation.py         # Standalone simulation CLI
├── scripts/
│   └── generate_dataset.py       # Synthetic dataset generator
└── documentation/                # Architecture, API & ML specifications
```

---

## 3. Technology Stack

| Layer | Technologies | Purpose |
|-------|--------------|---------|
| **Frontend UI** | React 18, TypeScript, Tailwind CSS v4, Framer Motion | High-performance reactive UI with rich dark theme aesthetics |
| **Interactive Graph** | React Flow (`@xyflow/react`) | Directed Acyclic Graph (DAG) dependency visualization |
| **Data Visualization** | Recharts, Plotly.js | Interactive charts, risk radar, and schedule distribution curves |
| **Backend API** | FastAPI, Uvicorn | High-throughput asynchronous REST API |
| **Database** | SQLite (`aiosqlite`) / PostgreSQL (`asyncpg`), SQLAlchemy 2.0 | Asynchronous relational data persistence |
| **Deep Learning** | Scikit-Learn MLP / TensorFlow Keras LSTM, Joblib | Delay probability forecasting & dependency classification |
| **Graph Algorithms** | NetworkX | PERT/CPM topological ordering, critical path calculation |
| **GenAI Assistant** | Groq API (`llama-3.3-70b-versatile`) | Natural language project insights grounded on live data |
