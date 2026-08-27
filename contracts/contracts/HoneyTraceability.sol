// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HoneyTraceability {
    struct BatchEvent {
        string batchId;
        string eventType; // e.g., "HARVESTED", "PACKAGED"
        string location;
        string ipfsHash;
        uint256 timestamp;
        address user;
    }

    mapping(string => BatchEvent[]) public batchEvents;
    mapping(string => bool) public registeredBatches;

    event BatchRegistered(string indexed batchId, string location, address indexed user);
    event EventAdded(string indexed batchId, string eventType, string ipfsHash, address indexed user);

    function registerBatch(string memory _batchId, string memory _location) public {
        require(!registeredBatches[_batchId], "Batch already registered");
        registeredBatches[_batchId] = true;
        
        batchEvents[_batchId].push(BatchEvent({
            batchId: _batchId,
            eventType: "REGISTERED",
            location: _location,
            ipfsHash: "",
            timestamp: block.timestamp,
            user: msg.sender
        }));

        emit BatchRegistered(_batchId, _location, msg.sender);
    }

    function addBatchEvent(
        string memory _batchId, 
        string memory _eventType, 
        string memory _location, 
        string memory _ipfsHash
    ) public {
        require(registeredBatches[_batchId], "Batch not registered");

        batchEvents[_batchId].push(BatchEvent({
            batchId: _batchId,
            eventType: _eventType,
            location: _location,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            user: msg.sender
        }));

        emit EventAdded(_batchId, _eventType, _ipfsHash, msg.sender);
    }

    function getBatchEvents(string memory _batchId) public view returns (BatchEvent[] memory) {
        return batchEvents[_batchId];
    }
}
