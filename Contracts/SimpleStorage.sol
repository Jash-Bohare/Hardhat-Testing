// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleStorage {
    uint256 private value;
    bool private initialized;

    function initialize(uint256 _value) external {
        require(!initialized, "Already initialized");
        value = _value;
        initialized = true;
    }

    function set(uint256 _value) external {
        require(initialized, "Not initialized");
        value = _value;
    }

    function get() external view returns (uint256) {
        return value;
    }

    function isInitialized() external view returns (bool) {
        return initialized;
    }
}
