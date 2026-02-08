// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PartySplit {

    address[] public members;
    uint public deposit;
    mapping(address => bool) public hasRSVPed;
	
    constructor(uint256 _deposit) {
        deposit = _deposit;
    }

    function rsvp() external payable {
        require(msg.value == deposit, "Incorrect deposit amount");
        
        require(!hasRSVPed[msg.sender], "Already RSVP'd");
        hasRSVPed[msg.sender] = true;
        members.push(msg.sender);
    }

    function payBill(address venue, uint amount) external {
        (bool s1, ) = venue.call{value: amount}("");
        require(s1);

        uint share = address(this).balance / members.length;

        for(uint i = 0; i< members.length; i++){
            (bool s2, ) = members[i].call{value: share}("");
            require(s2);
        }
    }
}