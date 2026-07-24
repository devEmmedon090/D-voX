// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ElectionManager} from"./ElectionManager.sol";

contract Consensus {
    ElectionManager public electionManager;
    mapping(uint => bool) public batchConsensusReached;

    event BatchConsensusTriggered(uint batchId, bool reached);
    event ElectionFinalized(uint finalBatchCount);

    constructor(address _electionManager) {
        electionManager = ElectionManager(_electionManager);
    }

    function confirmBatchConsensus(uint _batchId) external {
        // TODO: Restrict to validators (e.g., require validator list or multi-sig)
        require(_batchId <= electionManager.batchCount(), "Invalid batch");
        require(!batchConsensusReached[_batchId], "Consensus already reached");
        batchConsensusReached[_batchId] = true;
        emit BatchConsensusTriggered(_batchId, true);
    }

    function finalizeElection() external {
        // TODO: Restrict to admin or after voting period
        uint totalBatches = electionManager.batchCount();
        for (uint i = 1; i <= totalBatches; i++) {
            require(batchConsensusReached[i], "Not all batches confirmed");
        }
        emit ElectionFinalized(totalBatches);
    }
}