"""
Standalone runner & test script for TASKWEAVER Simulation Engine.
Usage:
    python simulation/run_simulation.py
"""
import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import json
from simulation.cpm_engine import CPMSimulator
from simulation.monte_carlo import MonteCarloSimulator
from simulation.what_if_simulator import WhatIfScenarioEngine

SAMPLE_TASKS = [
    {"id": "T1", "name": "Architecture Design", "duration": 5, "prerequisites": []},
    {"id": "T2", "name": "Database Schema Setup", "duration": 4, "prerequisites": ["T1"]},
    {"id": "T3", "name": "Auth API & JWT", "duration": 6, "prerequisites": ["T2"]},
    {"id": "T4", "name": "Frontend Wireframes", "duration": 4, "prerequisites": ["T1"]},
    {"id": "T5", "name": "Frontend Dashboard UI", "duration": 8, "prerequisites": ["T4"]},
    {"id": "T6", "name": "Payment Gateway Integration", "duration": 10, "prerequisites": ["T3"], "delay_probability": 0.8},
    {"id": "T7", "name": "End-to-End Testing", "duration": 5, "prerequisites": ["T5", "T6"]},
    {"id": "T8", "name": "Deployment & Release", "duration": 2, "prerequisites": ["T7"]},
]


def main():
    print("=" * 60)
    print("TASKWEAVER SIMULATION ENGINE DEMO")
    print("=" * 60)

    # 1. Critical Path Method
    print("\n[1] Running Critical Path Method (CPM)...")
    cpm = CPMSimulator(SAMPLE_TASKS)
    schedule = cpm.compute_schedule()
    critical_path = cpm.get_critical_path()
    total_duration = cpm.get_total_duration()

    print(f"Total Project Duration: {total_duration} days")
    print(f"Critical Path: {' -> '.join(critical_path)}")
    print("\nSchedule Details:")
    for tid, s in schedule.items():
        crit_tag = "[CRITICAL]" if s["is_critical"] else "          "
        print(f"  {tid} {crit_tag}: ES={s['es']:4.1f}d | EF={s['ef']:4.1f}d | LS={s['ls']:4.1f}d | LF={s['lf']:4.1f}d | Slack={s['total_float']:4.1f}d")

    # 2. What-If Delay Injection
    print("\n[2] Simulating Delay on Task T6 (+5 days)...")
    what_if = WhatIfScenarioEngine(SAMPLE_TASKS)
    delay_res = what_if.simulate_task_delay("T6", 5.0)
    print(f"Original Duration: {delay_res['original_duration_days']}d -> New Duration: {delay_res['new_duration_days']}d")
    print(f"Net Project Delay: +{delay_res['total_project_delay']}d")
    print(f"Critical Path Changed: {delay_res['critical_path_changed']}")
    print(f"Affected Tasks: {len(delay_res['affected_tasks'])}")

    # 3. Fast-Tracking / Crashing
    print("\n[3] Simulating Fast-Tracking on T6 (-3 days)...")
    crash_res = what_if.simulate_fast_tracking(["T6"], 3.0)
    print(f"Time Saved: {crash_res['time_saved_days']}d | New Duration: {crash_res['new_duration_days']}d")

    # 4. Monte Carlo Risk Simulation
    print("\n[4] Running Monte Carlo Simulation (2,000 iterations)...")
    mc_res = what_if.run_monte_carlo_comparison(iterations=2000)
    print(f"Mean Duration: {mc_res['mean_duration']}d (std: {mc_res['std_duration']}d)")
    print(f"Confidence Percentiles:")
    for p, val in mc_res["percentiles"].items():
        print(f"  {p}: {val} days")

    print("\nTask Criticality Index (prob of being on critical path):")
    for tid, ci in mc_res["criticality_index"].items():
        print(f"  {tid}: {ci}%")

    print("\n" + "=" * 60)
    print("SIMULATION COMPLETED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    main()
