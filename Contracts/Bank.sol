// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error NotOwner();
error InsufficientBalance(uint256 available, uint256 required);

contract Bank {
    address public owner;
    mapping(address => uint256) private balances;

    constructor() {
        owner = msg.sender;
    }

    function deposit() external payable {
        require(msg.value > 0, "Zero deposit");
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) external {
        uint256 bal = balances[msg.sender];
        if (bal < amount) {
            revert InsufficientBalance(bal, amount);
        }
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function emergencyWithdraw() external {
        if (msg.sender != owner) {
            revert NotOwner();
        }
        payable(owner).transfer(address(this).balance);
    }

    function balanceOf(address user) external view returns (uint256) {
        return balances[user];
    }
}
