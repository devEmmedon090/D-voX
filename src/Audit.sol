// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ElectionManager}from "./ElectionManager.sol";

contract Audit {    // function getBatchVotes(uint _batchId) external view returns (uint[] memory) {
    //     return electionManager.voteBatches(_batchId).voteIds;
    // }
    ElectionManager public electionManager;

    constructor(address _electionManager) {
        electionManager = ElectionManager(_electionManager);
    }

    // function getBatchVotes(uint _batchId) external view returns (uint[] memory) {
    //     return electionManager.voteBatches(_batchId).voteIds;
    // }
    function getBatchVotes(uint _batchId) external view returns (uint[] memory) {
    return electionManager.getBatchVoteIds(_batchId);
    }

    // function verifyVoterVote(address _voter, uint _batchId) ex   
    // function verifyVoterVote(address _voter, uint _batchId) external view returns (bool) {
    //     return electionManager.voteBatches(_batchId).votersInBatch(_voter);
    // }ternal view returns (bool) {
    //     return electionManager.voteBatches(_batchId).votersInBatch(_voter);
    // }
    function verifyVoters( address _voter, uint _batchId ) external view returns (bool) {
    return electionManager.isVoterInBatch(_batchId, _voter);
    }

    // function getCandidateVoteCount(uint _candidateId) external view returns (uint) {
    //     return electionManager.candidates(_candidateId).voteCount;
    // }
    function getCandidateVoteCount(uint _candidateId) external view returns (uint) {
    return electionManager.getCandidateVoteCount(_candidateId);
    }

}