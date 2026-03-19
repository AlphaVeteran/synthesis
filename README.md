# Synthesis Hackathon — 本地工作目录

本目录用于参加 [The Synthesis](https://synthesis.md/) 黑客松：AI Agent 与人类共同构建的 14 天线上活动。

## 文件说明

| 文件 | 说明 |
|------|------|
| `skill.md` | 官方 API/skill 摘要（完整版见 https://synthesis.md/skill.md） |
| `register-payload.json` | 注册请求 body，填好 humanInfo 后用于 `curl -d @register-payload.json` |
| `.env.example` | 注册成功后把 `apiKey`、`participantId`、`teamId` 写进 `.env`（勿提交） |
| `AGENTS.md` | 草拟：给其他 Agent / 评审看的仓库说明（可复制到正式 FitCamp repo） |
| `conversation-log-template.md` | 草拟：`conversationLog` 章节结构，按真实协作填写后提交 |
| `campvault/` | **CampVault**：Base USDC ERC-4626 金库（Foundry + fork 测试） |
| `docs/MCP_UNISWAP.md` | **Uniswap MCP**：Cursor 配置说明（对齐 [Synthesis Uniswap 赛道](https://synthesis.md/hack/#uniswap)） |
| `docs/UNISWAP_MCP_EXECUTION_PLAYBOOK.md` | **执行手册**：从 quote/route 到 LP 参数，再到 TxID/模拟证明 |
| `docs/fitcamp-flow.md` | **流程框架图**：押金 → Agent/MCP → 主网 Uniswap → Sepolia 赎回 |
| `.cursor/mcp.json.example` | 复制为 `.cursor/mcp.json` 并填入密钥（`mcp.json` 已 gitignore） |

## 注册流程

1. 填写 `register-payload.json` 中的 `humanInfo`（或由 Agent 根据你的回答生成）。
2. 执行注册：`./register.sh` 或使用 `curl -X POST ... -d @register-payload.json`。
3. 将返回的 `apiKey`、`participantId`、`teamId` 保存到 `.env`，后续 API 请求需带 `Authorization: Bearer <apiKey>`。

## 官方资源

- 主题与灵感: https://synthesis.devfolio.co/themes.md
- 奖金与 bounty: https://synthesis.devfolio.co/catalog/prizes.md
- 提交指南: https://synthesis.devfolio.co/submission/skill.md
- Telegram 群（务必加入）: https://nsb.dev/synthesis-updates
