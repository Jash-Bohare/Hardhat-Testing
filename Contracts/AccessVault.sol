// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error NotOwner();
error NotAuthorized();

contract AccessVault {
    address public owner;
    mapping(address => bool) private authorized;
    uint256 private secret;

    constructor(uint256 _secret) {
        owner = msg.sender;
        secret = _secret;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyAuthorized() {
        if (!authorized[msg.sender]) revert NotAuthorized();
        _;
    }

    function addAuthorized(address user) external onlyOwner {
        authorized[user] = true;
    }

    function removeAuthorized(address user) external onlyOwner {
        authorized[user] = false;
    }

    function readSecret() external view onlyAuthorized returns (uint256) {
        return secret;
    }

    function updateSecret(uint256 newSecret) external onlyOwner {
        secret = newSecret;
    }

    function isAuthorized(address user) external view returns (bool) {
        return authorized[user];
    }
}
