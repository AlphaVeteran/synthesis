# AGENTS.md — FitCamp × The Synthesis

本文档供 **AI Agent** 与评审快速理解本仓库：如何协作、边界与安全。

## 项目一句话

**FitCamp**：Base 上的健身打卡 / 承诺类 dApp（可含 Farcaster miniapp）；本黑客松方向包含与 **Uniswap / Agent 工具链** 相关的扩展（如押金、路由、Skills 集成等）。以你们最终提交描述为准，提交前请同步更新本节。

## 人类负责人

- **主要对接人**：Ada Li（Builder）
- **沟通渠道**：Cursor / 本仓库 Issue /（补充：Telegram 等）

## Agent 工作范围（建议）

| 可以做 | 不要做 |
|--------|--------|
| 读/改本仓库代码与文档 | 索要或保存用户 **私钥**、助记词 |
| 调用文档中的公开 API（Alchemy、Uniswap 文档等） | 将 **sk-synth-…** API Key 写入仓库或对话日志原文 |
| 起草合约、前端、提交文案与 `conversationLog` | 虚构未发生的协作内容（评审会对照 log 与 commit） |
| 通过 Devfolio API 协助创建/更新提交（需人类提供本机环境里的 Key） | 在公开 PR 中粘贴任何密钥 |

## 技术栈（提交前请与 `package.json` 对齐）

- **链**：Base（Mainnet / Sepolia 注明）
- **合约**：（例：Foundry / Hardhat ——按实际填写）
- **前端**：（例：Next.js / Vite ——按实际填写）
- **Agent 开发时 Harness**：Cursor  
- **主要模型**：（例：claude-sonnet-4-6 ——与 submission 一致）

## 本地开发（占位）

```bash
# 克隆后安装依赖（按实际包管理器修改）
# pnpm install
# cp .env.example .env
```

在 `.env` 中配置 RPC、合约地址等；**勿提交 `.env`**。

## 目录约定（按你们仓库实际增删）

```
/contracts or /packages/contracts  — 链上逻辑
/apps/web                         — 前端或 miniapp
/docs                             — 架构与决策记录（可选）
```

## 提交 Synthesis 时 Agent 可协助的字段

- `description` / `problemStatement`：多轮打磨  
- `submissionMetadata.skills` / `tools`：**只列真实使用过的**  
- `conversationLog`：见仓库内 `conversation-log-template.md` 结构，粘贴或链到 Gist/文件  

## 端到端流程图

见 **`docs/fitcamp-flow.md`**（押金 → Mainnet Uniswap / MCP → Sepolia 赎回）。

## Uniswap MCP（Cursor）

- 配置步骤见 **`docs/MCP_UNISWAP.md`**；示例：**`.cursor/mcp.json.example`** → 复制为 **`.cursor/mcp.json`**（已 gitignore）。  
- Synthesis Uniswap 赛道需 **Developer Platform API Key** + 真实 Tx，见 [hack#uniswap](https://synthesis.md/hack/#uniswap)。

## 疑问优先级

1. 安全与密钥 → 先问人类，默认不写进仓库。  
2. 链上交互 → 以已部署合约 ABI 与官方 Uniswap/Base 文档为准。  

---

*本文件为草拟模板，发布前请替换占位符并与最终 demo/repo 一致。*
