# 场景配方（来自上游 `apps/scenarios/`）

上游 `invest-skill` 的应用层除了时段综合分析（`session_analysis`），还声明了三个业务场景。
它们**只是把现有技能声明式串起来**，不含独立分析逻辑，因此本插件不把它们注册成单独技能条目
（否则技能目录里会多出三个与既有路由重叠的入口），而是作为配方随包分发：

| 场景 | 配方文件 | 编排的技能 | 并行方式 |
|---|---|---|---|
| 选股场景 | `stock_pick.yaml` | `macro_analysis` + `industry_brief` | 同一 `parallel_group` 并行 |
| 诊股场景 | `stock_diagnose.yaml` | `sentiment_risk_warning` + `stock_5d_deep_analysis` + `stock_comparative_analysis` | 同一 `parallel_group` 并行 |
| 策略场景 | `strategy.yaml` | `macro_analysis` + `sentiment_risk_warning` | 同一 `parallel_group` 并行 |

## 怎么用

用户说「跑一遍选股场景」「做个诊股」「策略场景看一下」时：

1. 读取对应 `scenarios/<场景>.yaml`，按 `steps` 顺序取 `skill_id`；
2. 同一 `parallel_group` 的步骤可并行，不同组串行；
3. 每个 `skill_id` 都对应本插件 `skills/<skill_id>/SKILL.md`，**先加载该技能，再按它的流程执行**；
4. 汇总成一份报告，每节标注来源技能与 `data_as_of`；缺失如实记录，不编造。

> 上游说明：这三个场景当前是编排骨架，主要用于验证「场景 → 技能」的编排链路，
> 不产出独立于上游技能的新结论。要真正的结论质量，仍取决于被编排的那些技能。
