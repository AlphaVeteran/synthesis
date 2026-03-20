# Conversation log — Human ↔ CampVault Agent

> 用于 Devfolio `conversationLog`。以下内容基于本项目真实协作过程整理，已对敏感信息脱敏。

---

## 1) 项目目标与范围收敛

- 人类最初目标：在 FitCamp 押金场景里做「动态质押池 Agent」，结合 Uniswap + MCP，形成可演示的 Agentic Finance 方案。
- 经过多轮讨论后明确：项目命名为 `CampVault Agent`，优先做可按时交付的 MVP。
- MVP 范围最终确定为：
  - 单币金库（Base USDC）；
  - `deposit / redeem / shares`；
  - 暂不做 slash（延期到二期）；
  - 联调压力大时先用独立 CampVault 演示页，不强依赖 FitCamp 主流程。

---

## 2) 架构与链路决策

- 讨论过 Base Sepolia 与 Base Mainnet 的取舍：
  - 合约开发/演示可在本地 fork 或测试网进行；
  - Uniswap 赛道产物（quote/route/交易证据）优先走 Base Mainnet 能力链路。
- 形成的核心流程：
  1. 用户在 CampVault 页面输入策略参数（Deposit/Horizon/Risk）并锁定；
  2. 页面生成可执行提示词；
  3. Agent 调用 Uniswap MCP 输出三阶段结果（quote+route -> lpPlan -> execution）。
- 文档化了流程图与执行手册，沉淀在 `docs/` 下（架构图、MCP 接入、执行 playbook）。

---

## 3) 核心实现与前端迭代

- 新建并完善 CampVault 相关代码与文档：
  - 合约、脚本、测试：`campvault/src`、`campvault/script`、`campvault/test`；
  - 演示文档与流程：`docs/` 多份说明。
- 页面层面实现了演示闭环：
  - 参数输入与“应用参数（固定策略约束）”；
  - “一键生成 Uniswap MCP 请求”；
  - Agent 单 JSON 粘贴、解析并分三段展示（quote / LP / execution）。
- 处理了关键前端问题：
  - 修复 `campvault/app.js` 字符串拼接语法错误，解决按钮无响应；
  - 本地 server 路由修复后，`/campvault/` 可正确加载。

---

## 4) Uniswap MCP 集成与排障过程

- 集成 `@clawnch/clawncher-mcp` 时遇到依赖问题（`workspace:*`）：
  - 通过 `package.json` 的 `overrides` 固定版本后可安装；
  - `mcp.json` 改为直接 `node dist/index.js`，避免 `npx` 反复拉取失败。
- 排障重点包括：
  - 私钥格式校验（需有效 hex 形态）；
  - RPC 占位符问题（替换为可用 Base RPC）；
  - 代理环境与 Node fetch 行为差异。
- 验证结论（关键进展）：
  - Trading API 连通性与认证可达（`check_approval` 返回成功结构）；
  - `/quote` 能返回完整 route 与报价数据；
  - 因对话上下文/工具可用性限制，`lpPlan` 与 `execution` 在部分轮次仍只能返回 error（遵循“不编造”约束）。

---

## 5) Skills 安装与可用性确认

- 为解决“缺少 Uniswap AI skills”问题，执行并验证了 skills 安装：
  - 使用 `npx skills add Uniswap/uniswap-ai`；
  - 最终 `npx skills ls` 显示 8 个 skills，且 `Agents: Cursor`。
- 已确认可用 skills 包括：
  - `liquidity-planner`、`swap-planner`、`swap-integration`、`viem-integration` 等。
- 建议操作约定：
  - 安装后重启 Cursor；
  - 用新会话再次执行 CampVault 提示词，减少旧上下文缓存影响。

---

## 6) 可验证产物与当前状态

- 已形成的可验证产物：
  - CampVault 前端可演示参数锁定与请求生成；
  - Uniswap 报价与路由可返回（含池地址、fee、amountOut/minOut、priceImpact）；
  - 已完成 Base Mainnet 小额真实交易并拿到 `txHash`；
  - 项目代码已整理并推送到 GitHub（`fitcamp` + `synthesis`）。
- 当前状态：
  - Quote/Route 链路在 `chainId=8453` 已稳定可用；
  - `chainId=84532` 会被 Uniswap Trading API 拒绝（已在流程中显式规避）；
  - `execution.txHash` 为 `null` 时代表未真实广播，已补充“如何获得真实 txHash”的操作路径。

---

## 7) 代码仓库与交付动作

- 仓库与推送记录：
  - 远程：`https://github.com/AlphaVeteran/synthesis.git`
  - 默认分支：`main`
  - 关键提交：`a7cd713`（skills、workspace、proxy/依赖调整等）
- FitCamp 仓库同步推送：
  - 远程：`https://github.com/AlphaVeteran/fitcamp.git`
  - 分支：`main`
  - 关键提交：`9873355`（CampVault 页面链路统一为 Base Mainnet 8453）
- 安全与仓库卫生：
  - `.cursor/mcp.json` 保持忽略（本地密钥不入库）；
  - `node_modules/`、`.DS_Store` 已加入忽略。

---

## 8) 后续计划（赛后/下一迭代）

- 继续提升：
  - 将 LP 计划从“可解释输出”升级为“可复算 + 可复验公式链路”；
  - 增加稳定的模拟执行证据或真实小额交易证据；
  - 推进 CampVault 与 FitCamp 的深度联调。
- 二期功能候选：
  - slash 机制；
  - 更细粒度风险参数与再平衡策略；
  - 更完善的 submission 自动化与演示脚本。

---

## 9) 本轮新增关键事件（主网演练闭环）

- 链路统一：
  - 将 CampVault 请求模板中的 `JSON schema`、`formatMcpRequestText`、`MCP 指引` 的 `chainId/chain_id` 统一为 `8453`；
  - 明确禁止在该链路使用 `84532`（Uniswap Trading API 不支持）。
- 小额真实演练（5 USDC）：
  - 先用 MCP 完成 `quote_only=true`；
  - 再发真实 swap（`quote_only=false`），成功拿到主网 `txHash`：
    - `0x19edc4e727bdbbba2a6705bf36abe7be95b16df94b970a7be117a9d76ee2cd11`
  - 用于录屏时可在 BaseScan 直接验证。
- 工具链波动与应对：
  - MCP 工具列表曾出现切换（`clawncher_uniswap_swap` 与 `clawncher_swap` 可用性波动）；
  - 发生过 Provider Error / Tool not found / RPC 429 等问题，处理方式为刷新 MCP、重试、改走稳定工具链。
- 页面侧“直接可执行”改进：
  - 在 `fitcamp/web/campvault/index.html` 增加“在 Uniswap 打开 USDC → WETH”深链按钮；
  - 让演示者可从页面直接跳到官方 Uniswap 完成真实 swap 并拿 `txHash`（不在页面托管私钥）。
