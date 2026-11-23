"""
Critical Path Method (CPM) and Delay Propagation Engine for TASKWEAVER.
Computes Early/Late times, Float (Slack), and analyzes delay ripple effects on Directed Acyclic Graphs (DAGs).
"""
import networkx as nx
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Set, Tuple


class CPMSimulator:
    def __init__(self, tasks: List[Dict[str, Any]]):
        """
        Initialize with a list of task dicts.
        Each task dict should have:
            - id: str
            - name: str
            - duration: float or int (in days)
            - prerequisites: List[str] (IDs of prerequisite tasks)
        """
        self.tasks = tasks
        self.task_map = {t["id"]: t for t in tasks}
        self.graph = self._build_graph()

    def _build_graph(self) -> nx.DiGraph:
        G = nx.DiGraph()
        for t in self.tasks:
            duration = float(t.get("duration", t.get("estimated_duration", 1)))
            G.add_node(t["id"], name=t.get("name", t["id"]), duration=max(0.1, duration))

        for t in self.tasks:
            prereqs = t.get("prerequisites", t.get("prerequisite_tasks", [])) or []
            for p in prereqs:
                if p in self.task_map:
                    G.add_edge(p, t["id"])

        return G

    def compute_schedule(self) -> Dict[str, Dict[str, float]]:
        """
        Computes CPM metrics:
            - ES (Early Start)
            - EF (Early Finish)
            - LS (Late Start)
            - LF (Late Finish)
            - TF (Total Float)
            - FF (Free Float)
            - is_critical (bool)
        """
        G = self.graph
        schedule: Dict[str, Dict[str, float]] = {}

        try:
            topo = list(nx.topological_sort(G))
        except nx.NetworkXUnfeasible:
            # Graph has cycle; fallback to arbitrary node order
            topo = list(G.nodes())

        # Forward Pass
        for node in topo:
            dur = G.nodes[node]["duration"]
            preds = list(G.predecessors(node))
            if not preds:
                es = 0.0
            else:
                es = max(schedule[p]["ef"] for p in preds if p in schedule)
            ef = es + dur
            schedule[node] = {"es": es, "ef": ef}

        project_duration = max((schedule[n]["ef"] for n in G.nodes()), default=0.0)

        # Backward Pass
        for node in reversed(topo):
            dur = G.nodes[node]["duration"]
            succs = list(G.successors(node))
            if not succs:
                lf = project_duration
            else:
                lf = min(schedule[s]["ls"] for s in succs if s in schedule)
            ls = lf - dur
            schedule[node]["ls"] = ls
            schedule[node]["lf"] = lf

            # Float
            tf = round(lf - schedule[node]["ef"], 4)
            schedule[node]["total_float"] = tf

            # Free Float: min(ES of successors) - EF of current
            if succs:
                min_succ_es = min(schedule[s]["es"] for s in succs)
                schedule[node]["free_float"] = round(max(0.0, min_succ_es - schedule[node]["ef"]), 4)
            else:
                schedule[node]["free_float"] = round(project_duration - schedule[node]["ef"], 4)

            schedule[node]["is_critical"] = abs(tf) < 0.001

        return schedule

    def get_critical_path(self) -> List[str]:
        """Returns list of task IDs that lie on the critical path."""
        schedule = self.compute_schedule()
        return [node for node, metrics in schedule.items() if metrics.get("is_critical", False)]

    def get_total_duration(self) -> float:
        """Returns project total duration along the critical path."""
        schedule = self.compute_schedule()
        return max((m["ef"] for m in schedule.values()), default=0.0)

    def simulate_delay(self, delayed_task_id: str, extra_days: float) -> Dict[str, Any]:
        """
        Simulate the impact of delaying a specific task by `extra_days`.
        Returns:
            - original_duration
            - new_duration
            - project_delay
            - critical_path_changed
            - affected_tasks
        """
        orig_schedule = self.compute_schedule()
        orig_duration = self.get_total_duration()
        orig_critical = set(self.get_critical_path())

        # Create modified graph
        if delayed_task_id not in self.graph:
            raise ValueError(f"Task {delayed_task_id} not found in dependency graph")

        new_sim = CPMSimulator([
            {
                **t,
                "duration": t.get("duration", t.get("estimated_duration", 1)) + (extra_days if t["id"] == delayed_task_id else 0)
            }
            for t in self.tasks
        ])

        new_schedule = new_sim.compute_schedule()
        new_duration = new_sim.get_total_duration()
        new_critical = set(new_sim.get_critical_path())

        # Determine affected tasks: tasks whose ES/EF shifted
        affected = []
        for tid in self.graph.nodes():
            orig_ef = orig_schedule[tid]["ef"]
            new_ef = new_schedule[tid]["ef"]
            shift = round(new_ef - orig_ef, 2)
            if shift > 0 or tid == delayed_task_id:
                affected.append({
                    "task_id": tid,
                    "task_name": self.graph.nodes[tid].get("name", tid),
                    "original_ef": orig_ef,
                    "new_ef": new_ef,
                    "delay_days": shift,
                    "is_critical": new_schedule[tid]["is_critical"],
                })

        return {
            "delayed_task_id": delayed_task_id,
            "additional_delay_days": extra_days,
            "original_duration_days": orig_duration,
            "new_duration_days": new_duration,
            "total_project_delay": round(new_duration - orig_duration, 2),
            "critical_path_changed": orig_critical != new_critical,
            "original_critical_path": list(orig_critical),
            "new_critical_path": list(new_critical),
            "affected_tasks": affected,
        }
