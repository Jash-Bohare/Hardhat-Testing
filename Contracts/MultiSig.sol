// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MultiSig {

    error NotOwner();
    error TxDoesNotExist();
    error TxAlreadyExecuted();
    error TxAlreadyConfirmed();
    error TxNotConfirmed();
    error InvalidRequirement();
    error InvalidOwner();
    error TxExecutionFailed();

    event Deposit(address indexed sender, uint amount);
    event Submit(uint indexed txId);
    event Confirm(address indexed owner, uint indexed txId);
    event Revoke(address indexed owner, uint indexed txId);
    event Execute(uint indexed txId);

    address[] public owners;
    mapping(address => bool) public isOwner;

    uint public required;
    uint public txCount;

    struct Transaction {
        address destination;
        uint value;
        bytes data;
        bool executed;
        uint numConfirmations;
    }

    mapping(uint => Transaction) public transactions;
    mapping(uint => mapping(address => bool)) public confirmations;

    modifier onlyOwner() {
        if (!isOwner[msg.sender]) revert NotOwner();
        _;
    }

    modifier txExists(uint _txId) {
        if (_txId >= txCount) revert TxDoesNotExist();
        _;
    }

    modifier notExecuted(uint _txId) {
        if (transactions[_txId].executed) revert TxAlreadyExecuted();
        _;
    }

    modifier notConfirmed(uint _txId) {
        if (confirmations[_txId][msg.sender]) revert TxAlreadyConfirmed();
        _;
    }


    constructor(address[] memory _owners, uint _required) {
        if (_owners.length == 0) revert InvalidOwner();
        if (_required == 0 || _required > _owners.length) revert InvalidRequirement();

        for (uint i; i < _owners.length; i++) {
            address owner = _owners[i];
            if (owner == address(0) || isOwner[owner]) revert InvalidOwner();

            isOwner[owner] = true;
            owners.push(owner);
        }

        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submitTransaction(
        address _destination,
        uint _value,
        bytes calldata _data
    ) external onlyOwner {
        if (_destination == address(0)) revert InvalidOwner();

        uint txId = txCount;

        transactions[txId] = Transaction({
            destination: _destination,
            value: _value,
            data: _data,
            executed: false,
            numConfirmations: 0
        });

        txCount++;

        emit Submit(txId);

        confirmTransaction(txId);
    }

    function confirmTransaction(uint _txId)
        public
        onlyOwner
        txExists(_txId)
        notExecuted(_txId)
        notConfirmed(_txId)
    {
        confirmations[_txId][msg.sender] = true;
        transactions[_txId].numConfirmations++;

        emit Confirm(msg.sender, _txId);

        if (transactions[_txId].numConfirmations >= required) {
            executeTransaction(_txId);
        }
    }

    function revokeConfirmation(uint _txId)
        external
        onlyOwner
        txExists(_txId)
        notExecuted(_txId)
    {
        if (!confirmations[_txId][msg.sender]) revert TxNotConfirmed();

        confirmations[_txId][msg.sender] = false;
        transactions[_txId].numConfirmations--;

        emit Revoke(msg.sender, _txId);
    }

    function executeTransaction(uint _txId)
        public
        onlyOwner
        txExists(_txId)
        notExecuted(_txId)
    {
        Transaction storage txn = transactions[_txId];

        if (txn.numConfirmations < required) revert InvalidRequirement();

        txn.executed = true;

        (bool success, ) = txn.destination.call{value: txn.value}(txn.data);
        if (!success) revert TxExecutionFailed();

        emit Execute(_txId);
    }
}
