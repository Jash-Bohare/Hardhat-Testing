// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Switch {

    address public owner;
    address public recipient;
    uint public lastAction;

    error NotOwner();

    modifier onlyOwner() {
        if(msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _recipient) payable {
        recipient = _recipient;
        owner = msg.sender;
        lastAction = block.timestamp;
    }

    function withdraw() external {
        require(block.timestamp - lastAction >= 52 weeks);
        (bool s, ) = recipient.call{value: address(this).balance}("");
        require(s);
    }

    function ping() external onlyOwner {
        lastAction = block.timestamp;
    }
}