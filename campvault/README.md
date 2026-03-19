# CampVault

Base 主网 **USDC** 单币金库（[ERC-4626](https://eips.ethereum.org/EIPS/eip-4626)）。MVP：**存入 / 赎回 / 份额**；**暂停**仅禁止新存入；**罚没 (slash)** 二期再做。

| 网络 | USDC |
|------|------|
| Base Mainnet | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`（6 位小数） |

## 依赖

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- OpenZeppelin（通过 `forge install` 拉取）

## 初始化

```bash
cd campvault
forge install OpenZeppelin/openzeppelin-contracts@v5.1.0 --no-commit
cp .env.example .env
# 编辑 .env：填入 BASE_RPC_URL（Alchemy/Infura 等）
```

## 测试（Base 主网 fork）

```bash
source .env   # 或 export BASE_RPC_URL=...
forge test --fork-url "$BASE_RPC_URL" -vv
```

测试内会 `deal` ETH 与 USDC，无需 Mock 代币。

## 部署 Base 主网

```bash
export CAMPVAULT_OWNER=0xYourAddress
forge script script/DeployCampVault.s.sol:DeployCampVault \
  --rpc-url "$BASE_RPC_URL" \
  --broadcast \
  --verify   # 可选
```

## 合约接口摘要

| 方法 | 说明 |
|------|------|
| `deposit(assets, receiver)` | 转入 USDC，给 receiver 铸份额 |
| `mint(shares, receiver)` | 精确铸份额，从 caller 扣 USDC |
| `withdraw(assets, receiver, owner)` | 按资产数量赎回 |
| `redeem(shares, receiver, owner)` | 按份额赎回 USDC |
| `pause` / `unpause` | `onlyOwner`；暂停后不可 `deposit`/`mint`，可 `withdraw`/`redeem` |

份额代币：`CampVault USDC Share` / `cvUSDC`。

## 前端集成

1. `IERC20(USDC).approve(vault, amount)`  
2. `vault.deposit(amount, user)` 或 `vault.redeem(shares, user, user)`  

## 二期（未实现）

- 链上 **slash**（打卡失败罚没）与预言机/角色设计
