from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import os

from app.database.db import get_db
from app.models.models import Task, Project, Employee, User
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/assistant", tags=["assistant"])


async def _fetch_context(db: AsyncSession) -> str:
    """Fetch live project/task stats to ground the assistant's responses."""
    total_proj = (await db.execute(select(func.count(Project.id)))).scalar() or 0
    active_proj = (await db.execute(
        select(func.count(Project.id)).where(Project.status == "active")
    )).scalar() or 0
    delayed_tasks = (await db.execute(
        select(func.count(Task.id)).where(Task.status.in_(["delayed", "blocked"]))
    )).scalar() or 0
    high_risk = (await db.execute(
        select(func.count(Task.id)).where(Task.risk_level.in_(["high", "critical"]))
    )).scalar() or 0

    # Top risky tasks
    result = await db.execute(
        select(Task).where(Task.delay_probability.isnot(None))
        .order_by(Task.delay_probability.desc()).limit(5)
    )
    risky = result.scalars().all()
    risky_list = "\n".join(
        f"- {t.name}: {int((t.delay_probability or 0) * 100)}% delay probability, risk={t.risk_level}"
        for t in risky
    ) or "None predicted yet — run batch predictions first."

    return f"""LIVE TASKWEAVER DATA (retrieved from database):
- Total Projects: {total_proj} ({active_proj} active)
- Delayed/Blocked Tasks: {delayed_tasks}
- High/Critical Risk Tasks: {high_risk}

Top Risk Tasks:
{risky_list}

You are the TASKWEAVER AI assistant. Answer questions using ONLY the data above and your knowledge of project management.
Do NOT invent statistics. If data is not available, say so clearly.
"""


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    context = await _fetch_context(db)

    # Try Groq API
    if settings.GROQ_API_KEY:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            completion = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": context},
                    {"role": "user", "content": request.message},
                ],
                max_tokens=1024,
                temperature=0.3,
            )
            response_text = completion.choices[0].message.content
            return ChatResponse(response=response_text, sources=["Live database", "LSTM predictions"])
        except Exception as e:
            print(f"[Groq error]: {e}")

    # Fallback rule-based responses using real data
    msg = request.message.lower()
    if any(w in msg for w in ["delay", "risk", "predict"]):
        result = await db.execute(
            select(Task).where(Task.delay_probability >= 0.5)
            .order_by(Task.delay_probability.desc()).limit(5)
        )
        tasks = result.scalars().all()
        if tasks:
            task_list = "\n".join(
                f"• {t.name} — {int((t.delay_probability or 0)*100)}% risk, risk level: {t.risk_level}"
                for t in tasks
            )
            resp = f"**Tasks with highest delay risk:**\n\n{task_list}\n\nThese are ranked by delay probability from the LSTM model. Run batch predictions to refresh these scores."
        else:
            resp = "No predictions available yet. Please run batch predictions on your projects first via the Delay Forecasting page."
    elif any(w in msg for w in ["overload", "workload", "employee", "team"]):
        resp = "Use the Workload Intelligence page to see team utilization. The system will flag employees above 85% utilization as overloaded and suggest rebalancing (requires manager approval)."
    elif any(w in msg for w in ["critical path", "critical"]):
        resp = "Critical path analysis is computed using NetworkX for all active projects. Tasks on the critical path have zero float — any delay on them directly extends the project deadline."
    else:
        resp = f"I have access to your live project data: {context.split('LIVE')[1][:200]}... Ask me about delays, risks, workload, or critical paths."

    return ChatResponse(response=resp, sources=["Live database"])
