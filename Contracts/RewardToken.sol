// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error NotVault();

contract RewardToken {
    string public name = "RewardToken";
    string public symbol = "RWD";
    uint8 public decimals = 18;

    mapping(address => uint256) public balanceOf;
    address public vault;

    constructor() {
        vault = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != vault) revert NotVault();
        balanceOf[to] += amount;
    }
}
