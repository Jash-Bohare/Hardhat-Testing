// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error TooEarly(uint256 currentTime, uint256 unlockTime);
error NothingToWithdraw();

contract TimeLock {
    address public beneficiary;
    uint256 public unlockTime;
    uint256 public balance;

    constructor(address _beneficiary, uint256 _unlockTime) payable {
        beneficiary = _beneficiary;
        unlockTime = _unlockTime;
        balance = msg.value;
    }

    function withdraw() external {
        if (balance == 0) revert NothingToWithdraw();
        if (block.timestamp < unlockTime) {
            revert TooEarly(block.timestamp, unlockTime);
        }

        uint256 amount = balance;
        balance = 0;
        payable(beneficiary).transfer(amount);
    }
}
