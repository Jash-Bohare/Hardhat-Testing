// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error AlreadyRegistered();
error NotRegistered();

contract EventRegistry {
    mapping(address => bool) private registered;

    event Registered(address indexed user);
    event Unregistered(address indexed user);

    function register() external {
        if (registered[msg.sender]) revert AlreadyRegistered();
        registered[msg.sender] = true;
        emit Registered(msg.sender);
    }

    function unregister() external {
        if (!registered[msg.sender]) revert NotRegistered();
        registered[msg.sender] = false;
        emit Unregistered(msg.sender);
    }

    function isRegistered(address user) external view returns (bool) {
        return registered[user];
    }
}
