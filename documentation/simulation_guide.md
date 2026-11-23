# TASKWEAVER Schedule Simulation Guide 📊

## 1. Critical Path Method (CPM)

### Mathematical Formulation
Given a Directed Acyclic Graph $G = (V, E)$ where vertices $v \in V$ represent tasks with durations $d(v)$, and edges $(u, v) \in E$ represent dependency constraints ($u$ must complete before $v$ can start):

1. **Forward Pass (Early Times)**:
   $$\text{ES}(v) = \max_{(u, v) \in E} \text{EF}(u) \quad (\text{with } \text{ES} = 0 \text{ if in-degree is } 0)$$
   $$\text{EF}(v) = \text{ES}(v) + d(v)$$
   Project Duration $T = \max_{v \in V} \text{EF}(v)$.

2. **Backward Pass (Late Times)**:
   $$\text{LF}(v) = \min_{(v, w) \in E} \text{LS}(w) \quad (\text{with } \text{LF} = T \text{ if out-degree is } 0)$$
   $$\text{LS}(v) = \text{LF}(v) - d(v)$$

3. **Float / Slack**:
   $$\text{Total Float (TF)}(v) = \text{LF}(v) - \text{EF}(v) = \text{LS}(v) - \text{ES}(v)$$
   $$\text{Free Float (FF)}(v) = \min_{(v, w) \in E} \text{ES}(w) - \text{EF}(v)$$

4. **Critical Path**:
   $$CP = \{v \in V \mid \text{TF}(v) = 0\}$$

---

## 2. Dynamic Delay Propagation

When a task $v_d$ experiences a delay $\Delta d$, TASKWEAVER does **not** perform linear addition to the project end date. Instead:
1. The duration of $v_d$ is updated: $d'(v_d) = d(v_d) + \Delta d$.
2. The forward and backward passes are recomputed across the entire DAG.
3. If $v_d$ had sufficient slack ($\text{TF}(v_d) \ge \Delta d$), the overall project completion date is **unaffected**.
4. If $\Delta d > \text{TF}(v_d)$, the project is delayed by $\Delta d - \text{TF}(v_d)$, and downstream paths may dynamically become new critical paths.

---

## 3. Monte Carlo Schedule Risk Simulation

Because deterministic estimates fail to account for real-world variance, TASKWEAVER incorporates Monte Carlo simulation:
- **Beta-PERT Distribution**:
  Samples duration $D_v \sim \text{PERT}(a, m, b)$ where:
  - $a$ is the optimistic duration ($0.75 \times \text{est}$)
  - $m$ is the most likely duration ($\text{est} \times (1 + 0.4 \times P_{\text{delay}})$)
  - $b$ is the pessimistic duration ($\text{est} \times (1.3 + P_{\text{delay}} \times \text{complexity})$)
- **Criticality Index (CI)**:
  Measures the percentage of Monte Carlo iterations in which task $v$ fell on the critical path:
  $$\text{CI}(v) = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(v \in CP_i) \times 100\%$$
- **Confidence Percentiles**:
  Reports P10, P50 (median), P80, P90, and P95 delivery confidence dates.
