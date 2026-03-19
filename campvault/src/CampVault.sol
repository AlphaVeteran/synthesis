// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title CampVault
/// @notice MVP: single-asset ERC-4626 vault on Base USDC — 存入 / 赎回 / 份额. 罚没 (slash) 预留二期.
/// @dev Pause 时禁止新存入 (deposit/mint)，允许 withdraw/redeem。
contract CampVault is ERC4626, Ownable, Pausable {
    error ZeroAddress();

    constructor(IERC20 asset_, address initialOwner)
        ERC20("CampVault USDC Share", "cvUSDC")
        ERC4626(asset_)
        Ownable(initialOwner)
    {
        if (address(asset_) == address(0) || initialOwner == address(0)) revert ZeroAddress();
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function deposit(uint256 assets, address receiver) public override whenNotPaused returns (uint256) {
        return super.deposit(assets, receiver);
    }

    function mint(uint256 shares, address receiver) public override whenNotPaused returns (uint256) {
        return super.mint(shares, receiver);
    }

    function maxDeposit(address receiver) public view override returns (uint256) {
        return paused() ? 0 : super.maxDeposit(receiver);
    }

    function maxMint(address receiver) public view override returns (uint256) {
        return paused() ? 0 : super.maxMint(receiver);
    }
}
