// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console2} from "forge-std/Script.sol";
import {CampVault} from "../src/CampVault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Base mainnet USDC (Circle)
address constant BASE_USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

contract DeployCampVault is Script {
    function run() external {
        address owner = vm.envAddress("CAMPVAULT_OWNER");
        vm.startBroadcast();
        CampVault vault = new CampVault(IERC20(BASE_USDC), owner);
        console2.log("CampVault:", address(vault));
        console2.log("asset (USDC):", address(vault.asset()));
        vm.stopBroadcast();
    }
}
