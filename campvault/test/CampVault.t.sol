// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {CampVault} from "../src/CampVault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

address constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

contract CampVaultTest is Test {
    CampVault public vault;
    address public alice = makeAddr("alice");
    address public owner = makeAddr("owner");

    /// @dev Base 主网 fork（构造时读链上 USDC decimals）
    function setUp() public {
        string memory rpc = vm.envOr("BASE_RPC_URL", string("https://mainnet.base.org"));
        vm.createSelectFork(rpc);
        vault = new CampVault(IERC20(BASE_USDC), owner);
        vm.deal(alice, 50 ether);
        deal(BASE_USDC, alice, 10_000e6);
    }

    function test_DepositMintShares() public {
        vm.startPrank(alice);
        IERC20(BASE_USDC).approve(address(vault), type(uint256).max);
        uint256 shares = vault.deposit(1000e6, alice);
        assertGt(shares, 0);
        assertEq(vault.balanceOf(alice), shares);
        assertEq(IERC20(BASE_USDC).balanceOf(address(vault)), 1000e6);
        vm.stopPrank();
    }

    function test_RedeemReturnsUSDC() public {
        vm.startPrank(alice);
        IERC20(BASE_USDC).approve(address(vault), type(uint256).max);
        uint256 shares = vault.deposit(500e6, alice);
        uint256 balBefore = IERC20(BASE_USDC).balanceOf(alice);
        vault.redeem(shares, alice, alice);
        assertEq(IERC20(BASE_USDC).balanceOf(alice), balBefore + 500e6);
        assertEq(vault.balanceOf(alice), 0);
        vm.stopPrank();
    }

    function test_WithdrawByAssets() public {
        vm.startPrank(alice);
        IERC20(BASE_USDC).approve(address(vault), type(uint256).max);
        vault.deposit(300e6, alice);
        uint256 before = IERC20(BASE_USDC).balanceOf(alice);
        vault.withdraw(300e6, alice, alice);
        assertEq(IERC20(BASE_USDC).balanceOf(alice), before + 300e6);
        vm.stopPrank();
    }

    function test_PauseBlocksDeposit() public {
        vm.prank(owner);
        vault.pause();
        vm.startPrank(alice);
        IERC20(BASE_USDC).approve(address(vault), type(uint256).max);
        vm.expectRevert();
        vault.deposit(100e6, alice);
        vm.stopPrank();
    }

    function test_PauseAllowsRedeem() public {
        vm.startPrank(alice);
        IERC20(BASE_USDC).approve(address(vault), type(uint256).max);
        uint256 sh = vault.deposit(200e6, alice);
        vm.stopPrank();

        vm.prank(owner);
        vault.pause();

        vm.prank(alice);
        vault.redeem(sh, alice, alice);
        assertEq(vault.balanceOf(alice), 0);
    }

    function test_UnpauseDeposit() public {
        vm.prank(owner);
        vault.pause();
        vm.prank(owner);
        vault.unpause();

        vm.startPrank(alice);
        IERC20(BASE_USDC).approve(address(vault), type(uint256).max);
        vault.deposit(50e6, alice);
        assertGt(vault.balanceOf(alice), 0);
        vm.stopPrank();
    }
}
