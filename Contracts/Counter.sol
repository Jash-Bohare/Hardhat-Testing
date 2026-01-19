// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 private count;

    constructor(uint256 _initialValue) {
        count = _initialValue;
    }

    function get() external view returns (uint256) {
        return count;
    }

    function increment() external {
        count += 1;
    }

    function decrement() external {
        require(count > 0, "Counter: below zero");
        count -= 1;
    }
}
