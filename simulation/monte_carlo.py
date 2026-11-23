"""
Monte Carlo Schedule Risk Simulation for TASKWEAVER.
Uses Beta-PERT and Triangular distributions to simulate project schedules across thousands of iterations,
generating completion percentiles (P10, P50, P80, P90, P95) and task Criticality Indices.
"""
import numpy as np
import networkx as nx
from typing import Dict, List, Any, Optional


class MonteCarloSimulator:
    def __init__(self, tasks: List[Dict[str, Any]], iterations: int = 2000, seed: int = 42):
        """
        Args:
            tasks: List of task dictionaries with id, name, estimated_duration,
                   and optionally: delay_probability, complexity, prerequisite_tasks.
            iterations: Number of Monte Carlo iterations (default 2000).
            seed: Random seed for reproducibility.
        """
        self.tasks = tasks
        self.iterations = iterations
        self.seed = seed
        self.task_map = {t["id"]: t for t in tasks}

        # Build graph structure
        self.graph = nx.DiGraph()
        for t in self.tasks:
            self.graph.add_node(t["id"], name=t.get("name", t["id"]))
        for t in self.tasks:
            prereqs = t.get("prerequisites", t.get("prerequisite_tasks", [])) or []
            for p in prereqs:
                if p in self.task_map:
                    self.graph.add_edge(p, t["id"])

        try:
            self.topo_order = list(nx.topological_sort(self.graph))
        except nx.NetworkXUnfeasible:
            self.topo_order = list(self.graph.nodes())

    def _sample_durations(self, n_samples: int) -> Dict[str, np.ndarray]:
        """
        Sample task durations using Beta-PERT approximation.
        Optimistic (a) = 0.8 * estimated
        Most likely (m) = estimated * (1 + 0.1 * delay_prob)
        Pessimistic (b) = estimated * (1.5 + delay_prob)
        """
        rng = np.random.default_rng(self.seed)
        sampled: Dict[str, np.ndarray] = {}

        for t in self.tasks:
            est = float(t.get("duration", t.get("estimated_duration", 5)))
            prob = float(t.get("delay_probability", 0.3))
            comp = str(t.get("complexity", "medium")).lower()

            multiplier = 1.3 if comp == "high" else (1.1 if comp == "medium" else 1.0)
            a = max(0.5, est * 0.75)
            m = max(a, est * (1.0 + prob * 0.4))
            b = max(m, est * (1.3 + prob * multiplier))

            # Beta-PERT mean and variance
            mean = (a + 4 * m + b) / 6.0
            std = (b - a) / 6.0

            # Guard against zero variance
            if std < 1e-4:
                sampled[t["id"]] = np.full(n_samples, fill_value=m)
            else:
                alpha = ((mean - a) / (b - a)) * (((mean - a) * (b - mean) / (std ** 2)) - 1)
                beta = alpha * (b - mean) / (mean - a) if (mean - a) > 0 else 2.0
                alpha = max(0.1, alpha)
                beta = max(0.1, beta)
                samples = a + rng.beta(alpha, beta, size=n_samples) * (b - a)
                sampled[t["id"]] = np.round(np.clip(samples, a, b), 2)

        return sampled

    def run(self) -> Dict[str, Any]:
        """
        Run the Monte Carlo simulation.
        Returns:
            - percentiles (P10, P25, P50, P75, P80, P90, P95)
            - mean_duration, std_duration, min_duration, max_duration
            - criticality_index: percentage of times each task was on the critical path
            - histogram: bins and frequency for plotting
        """
        sampled = self._sample_durations(self.iterations)
        project_durations = np.zeros(self.iterations)
        criticality_counts = {t["id"]: 0 for t in self.tasks}

        # Vectorized forward pass per iteration
        for i in range(self.iterations):
            ef_times: Dict[str, float] = {}
            for node in self.topo_order:
                dur = float(sampled[node][i])
                preds = list(self.graph.predecessors(node))
                es = max((ef_times[p] for p in preds), default=0.0)
                ef_times[node] = es + dur

            proj_end = max(ef_times.values(), default=0.0)
            project_durations[i] = proj_end

            # Backward pass to find critical nodes in this sample
            lf_times: Dict[str, float] = {}
            for node in reversed(self.topo_order):
                dur = float(sampled[node][i])
                succs = list(self.graph.successors(node))
                lf = min((lf_times[s] - float(sampled[s][i]) for s in succs), default=proj_end)
                lf_times[node] = lf
                # If Early Finish == Late Finish (slack ~ 0)
                if abs(lf - ef_times[node]) < 0.1:
                    criticality_counts[node] += 1

        # Calculate percentiles
        p10, p25, p50, p75, p80, p90, p95 = np.percentile(
            project_durations, [10, 25, 50, 75, 80, 90, 95]
        )

        criticality_index = {
            t["id"]: round(criticality_counts[t["id"]] / self.iterations * 100, 1)
            for t in self.tasks
        }

        # Histogram data (15 bins)
        counts, bin_edges = np.histogram(project_durations, bins=15)
        histogram = [
            {
                "range": f"{round(bin_edges[k], 1)} - {round(bin_edges[k+1], 1)}d",
                "count": int(counts[k]),
                "percentage": round(float(counts[k]) / self.iterations * 100, 1),
            }
            for k in range(len(counts))
        ]

        return {
            "iterations": self.iterations,
            "mean_duration": round(float(np.mean(project_durations)), 2),
            "std_duration": round(float(np.std(project_durations)), 2),
            "min_duration": round(float(np.min(project_durations)), 2),
            "max_duration": round(float(np.max(project_durations)), 2),
            "percentiles": {
                "P10": round(float(p10), 1),
                "P25": round(float(p25), 1),
                "P50": round(float(p50), 1),
                "P75": round(float(p75), 1),
                "P80": round(float(p80), 1),
                "P90": round(float(p90), 1),
                "P95": round(float(p95), 1),
            },
            "criticality_index": criticality_index,
            "histogram": histogram,
        }
