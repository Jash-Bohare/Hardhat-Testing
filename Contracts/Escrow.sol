// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error NotDepositor();
error NothingToRelease();

contract Escrow {
    address public depositor;
    address public beneficiary;
    uint256 public deposited;

    constructor(address _beneficiary) {
        depositor = msg.sender;
        beneficiary = _beneficiary;
    }

    function deposit() external payable {
        if (msg.sender != depositor) revert NotDepositor();
        deposited += msg.value;
    }

    function release() external {
        if (deposited == 0) revert NothingToRelease();

        uint256 amount = deposited;
        deposited = 0;
        payable(beneficiary).transfer(amount);
    }
}
