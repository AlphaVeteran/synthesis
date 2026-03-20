# Uniswap MCP + uniswap-ai Skills 执行手册（MVP）

目标：在不重做大量业务逻辑的前提下，产出 3 个可验证结果：

1. `quote/route` 输出  
2. `LP` 计划参数（`tick/fee/slippage`）  
3. 至少一笔可验证执行（`TxID` 或模拟证明）

架构图（GitHub）：[`docs/campvault_agent_frame.png`](https://github.com/AlphaVeteran/synthesis/blob/main/docs/campvault_agent_frame.png)

---

## 0. 前置准备（一次性）

1) 你已有：
- CampVault 页面：`http://localhost:3000/campvault/`
- CampVault 参数输入（Deposit/Horizon/Risk）

2) 配置 MCP（本地）：
- 复制：`.cursor/mcp.json.example` -> `.cursor/mcp.json`
- 填入密钥（不要提交到 git）：
  - `UNISWAP_API_KEY`
  - `CLAWNCHER_PRIVATE_KEY`（仅用于你愿意执行真实交易时）
  - `CLAWNCHER_NETWORK=mainnet`
  - `CLAWNCHER_RPC_URL`（建议 Alchemy/Infura）

3) 加载 Uniswap 技能（任选其一）：
- `npx skills add Uniswap/uniswap-ai`
- 或按你当前 agent 平台的 skills/plugin 方式安装

---

## 1. 产物 A：Quote / Route（0 gas）

在 Cursor 对 CampVault Agent 发送以下提示词：

```text
使用 Uniswap MCP 在 Base Mainnet (chainId=8453) 执行：
1) 对 USDC -> WETH 做 exactIn 报价，amountIn = 20 USDC
2) 返回 route、estimatedOut、minimumReceived、slippageAssumption
3) 输出 JSON，字段固定为:
{
  "chainId": 8453,
  "tokenIn": "USDC",
  "tokenOut": "WETH",
  "amountIn": "20",
  "estimatedOut": "...",
  "minimumReceived": "...",
  "route": "...",
  "feeTierOrPool": "..."
}
```

保存证据：
- 对话截图（含 route/estimatedOut）
- JSON 文本复制到 `conversationLog`

---

## 2. 产物 B：LP 参数（tick/fee/slippage）

继续对 Agent 发送：

```text
基于上一步 quote，给出 7 天 LP 计划（MVP）：
- pair: USDC/WETH
- risk: conservative（可改 medium）
- 输出 fee tier、tickLower、tickUpper、建议 slippage、deadlineMinutes
- 说明 amountUSDCToSwap（单币入场先换部分 WETH）
返回 JSON:
{
  "pair": ["USDC","WETH"],
  "feeTier": "...",
  "tickLower": "...",
  "tickUpper": "...",
  "amountUSDCToSwap": "...",
  "slippage": "...",
  "deadlineMinutes": 20,
  "notes": "..."
}
```

保存证据：
- 对话截图（必须看见 `tickLower/tickUpper/fee/slippage`）

---

## 3. 产物 C：可验证执行（TxID 或模拟）

### 方案 C1（推荐，最省钱）：模拟证明

```text
基于上面的 LP 计划，生成可执行交易预览（calldata / to / value / expected effects）。
如果你的工具支持 dry-run/simulate，请返回 simulation result（success/fail + reason）。
```

证据：
- 模拟成功截图（或 JSON `success: true`）

### 方案 C2（加分）：真实小额执行

```text
用最小风险执行一笔真实交易（先 swap 20 USDC -> WETH），返回 txHash。
要求：
- chainId=8453
- slippage 控制在 <=0.5%
- 如失败，输出失败原因并给出修复建议
```

证据：
- `txHash`
- 区块浏览器打开成功页面截图

---

## 4. 录视频时的最短演示顺序（90 秒）

1) 在 `campvault/` 页面输入参数并点「应用参数」  
2) 在 Cursor 发“Quote/Route”提示词，展示 JSON  
3) 发“LP 参数”提示词，展示 `tick/fee/slippage`  
4) 展示 `txHash` 或模拟成功结果  

---

## 5. 提交时如何写（精简）

- `tools`: `MCP`, `Uniswap`, `CampVault`
- `skills`: `uniswap-ai`（只写你实际加载过的）
- `videoURL`: 包含上面 3 类产物
- `conversationLog`: 放关键提示词 + 关键输出

---

## 6. 失败时快速排查

- 报价失败：检查 `chainId`、token 地址/符号、RPC 是否可用  
- 执行失败：检查钱包 gas、授权、slippage 是否过低  
- 无法出 LP 参数：先强制输出 fee/tick 的候选范围，再迭代

