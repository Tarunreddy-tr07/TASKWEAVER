"""
What-If Scenario Simulation Engine for TASKWEAVER.
Enables project managers to test schedule interventions:
- Task delay injection & ripple effect
- Fast-tracking / Crashing (duration compression on critical path)
- Resource reallocation & workload relief
- Scope creep sensitivity analysis
"""
from typing import Dict, List, Any, Optional
from .cpm_engine import CPMSimulator
from .monte_carlo import MonteCarloSimulator


class WhatIfScenarioEngine:
    def __init__(self, tasks: List[Dict[str, Any]]):
        self.base_tasks = tasks
        self.base_cpm = CPMSimulator(tasks)
        self.base_schedule = self.base_cpm.compute_schedule()
        self.base_duration = self.base_cpm.get_total_duration()
        self.base_critical_path = self.base_cpm.get_critical_path()

    def simulate_task_delay(self, task_id: str, additional_days: float) -> Dict[str, Any]:
        """Test the ripple effect if a specific task is delayed."""
        return self.base_cpm.simulate_delay(task_id, additional_days)

    def simulate_fast_tracking(self, target_task_ids: List[str], compression_days: float) -> Dict[str, Any]:
        """
        Compress duration of selected critical tasks (crashing/fast-tracking).
        Evaluates resulting project duration and identifies if a new critical path emerges.
        """
        modified_tasks = []
        for t in self.base_tasks:
            dur = float(t.get("duration", t.get("estimated_duration", 1)))
            if t["id"] in target_task_ids:
                dur = max(1.0, dur - compression_days)
            modified_tasks.append({**t, "duration": dur})

        new_cpm = CPMSimulator(modified_tasks)
        new_duration = new_cpm.get_total_duration()
        new_critical_path = new_cpm.get_critical_path()

        return {
            "scenario": "fast_tracking",
            "compressed_tasks": target_task_ids,
            "compression_per_task_days": compression_days,
            "original_duration_days": self.base_duration,
            "new_duration_days": new_duration,
            "time_saved_days": round(self.base_duration - new_duration, 2),
            "original_critical_path": self.base_critical_path,
            "new_critical_path": new_critical_path,
            "critical_path_shifted": set(self.base_critical_path) != set(new_critical_path),
        }

    def simulate_scope_creep(self, percentage_increase: float) -> Dict[str, Any]:
        """
        Simulate systemic scope creep (+X% duration across all uncompleted tasks).
        """
        multiplier = 1.0 + (percentage_increase / 100.0)
        modified_tasks = [
            {
                **t,
                "duration": round(float(t.get("duration", t.get("estimated_duration", 1))) * multiplier, 2)
            }
            for t in self.base_tasks
        ]

        new_cpm = CPMSimulator(modified_tasks)
        new_duration = new_cpm.get_total_duration()

        return {
            "scenario": "scope_creep",
            "percentage_increase": percentage_increase,
            "original_duration_days": self.base_duration,
            "new_duration_days": new_duration,
            "total_slippage_days": round(new_duration - self.base_duration, 2),
            "new_critical_path": new_cpm.get_critical_path(),
        }

    def run_monte_carlo_comparison(self, iterations: int = 1500) -> Dict[str, Any]:
        """Run Monte Carlo schedule risk analysis for the project."""
        mc = MonteCarloSimulator(self.base_tasks, iterations=iterations)
        return mc.run()
