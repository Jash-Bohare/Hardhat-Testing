// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RewardToken.sol";

error NothingStaked();

contract StakingVault {
    RewardToken public token;
    mapping(address => uint256) public stakes;

    constructor() {
        token = new RewardToken();
    }

    function stake() external payable {
        stakes[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amount = stakes[msg.sender];
        if (amount == 0) revert NothingStaked();

        stakes[msg.sender] = 0;

        // simple reward: 10% of stake
        token.mint(msg.sender, amount / 10);

        payable(msg.sender).transfer(amount);
    }
}
