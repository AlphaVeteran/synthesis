# Uniswap × MCP（Synthesis / CampVault）

与 [Synthesis Hack — Uniswap 赛道](https://synthesis.md/hack/#uniswap) 对齐：**须使用真实的 Uniswap Developer Platform API Key**，并在测试网或主网产生 **真实 TxID**（见 [奖品说明 — Agentic Finance](https://synthesis.devfolio.co/catalog/prizes.md)）。

---

## 推荐：Clawncher MCP（Base + Uniswap Trading API）

[`@clawnch/clawncher-mcp`](https://www.npmjs.com/package/@clawnch/clawncher-mcp) 面向 **Base**，提供：

| 能力 | 工具示例 | 与 Uniswap API |
|------|----------|----------------|
| V4 报价 / 池子只读 | `clawncher_uniswap_quote`、`clawncher_v4_pool` | 部分只读链上 |
| **经 Uniswap Trading API 执行 swap** | `clawncher_uniswap_swap` | **需要 `UNISWAP_API_KEY`** |

### 1. 申请 API Key

1. 打开 [Uniswap Developer Portal](https://developers.uniswap.org/dashboard)（文档见 [API FAQs](https://api-docs.uniswap.org/guides/faqs)）。  
2. 创建 API Key，请求头使用 `x-api-key`（由 MCP/服务端封装，你只需配环境变量）。

### 2. 准备钱包（仅用于 Agent 代签 swap 的测试钱包）

- 使用 **小额专用钱包**，**勿**与主资产混用。  
- **永远不要**把私钥提交到 Git 或写进 `conversationLog`。

### 3. 接入 Cursor MCP

1. 复制示例配置：

   ```bash
   cp .cursor/mcp.json.example .cursor/mcp.json
   ```

2. 编辑 `.cursor/mcp.json`，将占位符换成：

   - `UNISWAP_API_KEY`：Developer Portal 的 key  
   - `CLAWNCHER_PRIVATE_KEY`：`0x…`（仅用于需要上链的 tool）  
   - `CLAWNCHER_RPC_URL`：建议改为 **Alchemy / Infura Base Mainnet**（比公共 RPC 稳定）

3. 重启 Cursor 或 **Settings → MCP → Refresh**。

4. 在对话里可要求 Agent：  
   - 先 `clawncher_uniswap_quote` / `clawncher_price`  
   - 需要真实 Tx 时再 `clawncher_uniswap_swap`（小额 + Base）

`.cursor/mcp.json` 已列入 `.gitignore`，避免误提交密钥。

---

## 备选：Uniswap Trader MCP（V3 多链，含 Base）

社区项目 [kukapay/uniswap-trader-mcp](https://github.com/kukapay/uniswap-trader-mcp)：

- **Base `chainId`: 8453**  
- 环境变量：`INFURA_KEY`（或按其 README 的 RPC 配置）、`WALLET_PRIVATE_KEY`  
- 工具：`getPrice`、`executeSwap`  

**注意**：该路径未必走 Uniswap **Developer Platform** 的 `x-api-key`。冲 **Uniswap 官方 bounty** 时，仍以 **Clawncher + `UNISWAP_API_KEY`** 或文档要求的 API 为准；本项可作为报价/路由补充。

示例（自行合并到 `mcp.json` 的 `mcpServers`）：

```json
"uniswap-trader-v3": {
  "command": "npx",
  "args": ["-y", "@kukapay/uniswap-trader-mcp"],
  "env": {
    "INFURA_KEY": "YOUR_INFURA_KEY",
    "WALLET_PRIVATE_KEY": "0x..."
  }
}
```

---

## 与 CampVault 分工

| 组件 | 网络 | 说明 |
|------|------|------|
| CampVault | Base Sepolia（或主网） | 押金份额，链上存取 |
| Uniswap MCP | Base 主网（8453） | 报价 / swap，满足 bounty 的 API + TxID |

Agent 编排：**Vault 押金逻辑** 与 **Uniswap 换仓/流动性** 分链说明，写进 README 与提交 `description`。

---

## 提交 metadata 建议

- **tools**: `MCP`, `@clawnch/clawncher-mcp`, `Uniswap Trading API`, `Base`  
- **helpfulResources**: `https://developers.uniswap.org/`, `https://api-docs.uniswap.org/`  
