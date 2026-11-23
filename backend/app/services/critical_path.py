"""
Project completion forecasting using NetworkX critical path analysis.
"""
import networkx as nx
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.models import Task, Project


class CriticalPathAnalyzer:
    """
    Implements PERT/CPM critical path analysis.
    Considers task dependencies, predicted durations, and parallel execution.
    """

    def build_graph(self, tasks: List[Task]) -> nx.DiGraph:
        G = nx.DiGraph()
        task_map = {t.id: t for t in tasks}

        # Add nodes
        for t in tasks:
            duration = t.predicted_duration or t.estimated_duration or 5
            G.add_node(t.id, name=t.name, duration=duration,
                       status=str(t.status), completion=t.completion_percentage)

        # Add dependency edges
        for t in tasks:
            prereqs = t.prerequisite_tasks or []
            for dep_id in prereqs:
                if dep_id in task_map:
                    G.add_edge(dep_id, t.id)

        return G

    def compute_earliest_times(self, G: nx.DiGraph) -> Dict[str, Dict]:
        """Forward pass — compute earliest start and finish times."""
        times = {}
        try:
            topo_order = list(nx.topological_sort(G))
        except nx.NetworkXUnfeasible:
            topo_order = list(G.nodes())

        for node in topo_order:
            duration = G.nodes[node].get("duration", 5)
            predecessors = list(G.predecessors(node))
            if not predecessors:
                es = 0
            else:
                es = max(times[p]["ef"] for p in predecessors if p in times)
            ef = es + duration
            times[node] = {"es": es, "ef": ef}
        return times

    def compute_latest_times(self, G: nx.DiGraph, earliest: Dict) -> Dict[str, Dict]:
        """Backward pass — compute latest start and finish times."""
        if not earliest:
            return {}
        project_end = max(v["ef"] for v in earliest.values()) if earliest else 0
        times = {}
        try:
            topo_order = list(reversed(list(nx.topological_sort(G))))
        except nx.NetworkXUnfeasible:
            topo_order = list(G.nodes())

        for node in topo_order:
            duration = G.nodes[node].get("duration", 5)
            successors = list(G.successors(node))
            if not successors:
                lf = project_end
            else:
                lf = min(times[s]["ls"] for s in successors if s in times)
            ls = lf - duration
            times[node] = {"ls": ls, "lf": lf}
        return times

    def get_critical_path(self, tasks: List[Task]) -> List[str]:
        """Returns list of task IDs on the critical path."""
        G = self.build_graph(tasks)
        if not G.nodes():
            return []
        earliest = self.compute_earliest_times(G)
        latest = self.compute_latest_times(G, earliest)
        critical = [
            node for node in G.nodes()
            if node in earliest and node in latest
            and abs((earliest[node]["es"] - latest[node]["ls"])) < 0.5  # float tolerance
        ]
        return critical

    def forecast_completion(
        self,
        tasks: List[Task],
        project_start: Optional[datetime] = None,
    ) -> Dict:
        """
        Compute predicted project completion date.
        Accounts for parallel task execution, completed tasks, and predicted durations.
        """
        if not tasks:
            return {"predicted_days": 0, "critical_path": [], "critical_path_length": 0}

        incomplete = [t for t in tasks if str(t.status) not in ("completed",)]
        G = self.build_graph(incomplete)
        critical_ids = self.get_critical_path(incomplete)
        earliest = self.compute_earliest_times(G)

        total_days = max((v["ef"] for v in earliest.values()), default=0) if earliest else 0
        start = project_start or datetime.utcnow()
        predicted_date = start + timedelta(days=total_days)

        return {
            "predicted_completion_date": predicted_date,
            "predicted_days_remaining": total_days,
            "critical_path_task_ids": critical_ids,
            "critical_path_length": len(critical_ids),
            "parallel_efficiency": self._parallel_efficiency(G, total_days),
        }

    def _parallel_efficiency(self, G: nx.DiGraph, total_days: int) -> float:
        if not G.nodes() or total_days == 0:
            return 1.0
        sum_durations = sum(G.nodes[n].get("duration", 5) for n in G.nodes())
        return round(sum_durations / max(total_days, 1), 2)

    def simulate_delay(
        self,
        tasks: List[Task],
        delayed_task_id: str,
        additional_days: int,
        project_start: Optional[datetime] = None,
    ) -> Dict:
        """
        Simulate a delay on a specific task and return propagated impact.
        """
        # Modify the delayed task's duration
        modified_tasks = []
        for t in tasks:
            if t.id == delayed_task_id:
                # Create a mock with increased duration
                class MockTask:
                    def __init__(self, orig, extra):
                        self.__dict__.update(orig.__dict__.copy())
                        self.estimated_duration = (orig.estimated_duration or 5) + extra
                        self.predicted_duration = (orig.predicted_duration or orig.estimated_duration or 5) + extra
                modified_tasks.append(MockTask(t, additional_days))
            else:
                modified_tasks.append(t)

        original = self.forecast_completion(tasks, project_start)
        simulated = self.forecast_completion(modified_tasks, project_start)

        orig_days = original.get("predicted_days_remaining", 0)
        sim_days = simulated.get("predicted_days_remaining", 0)
        delay_impact = sim_days - orig_days

        # Find affected tasks (downstream from delayed task)
        G = self.build_graph(tasks)
        try:
            affected_ids = list(nx.descendants(G, delayed_task_id))
        except nx.NetworkXError:
            affected_ids = []

        affected_tasks = []
        for t in tasks:
            if t.id in affected_ids:
                is_critical = t.id in (simulated.get("critical_path_task_ids") or [])
                affected_tasks.append({
                    "task_id": t.id,
                    "task_name": t.name,
                    "delay_days": delay_impact if is_critical else max(0, delay_impact - 1),
                    "is_critical": is_critical,
                })

        return {
            "original_days": orig_days,
            "simulated_days": sim_days,
            "total_delay": delay_impact,
            "affected_task_ids": affected_ids,
            "affected_tasks": affected_tasks,
            "critical_path_changed": simulated.get("critical_path_task_ids") != original.get("critical_path_task_ids"),
        }


critical_path_analyzer = CriticalPathAnalyzer()
