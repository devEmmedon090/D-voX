// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VoterRegistry} from "./VoterRegistry.sol";

contract ElectionManager {
    VoterRegistry public voterRegistry;
    

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct VoteBatch {
        uint batchId;
        uint[] voteIds;
        mapping(address => bool) votersInBatch;
    }

    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    mapping(uint => VoteBatch) public voteBatches;
    uint public batchCount;

    event CandidateAdded(uint id, string name);
    event VoteCasted(uint batchId, address voter, uint candidateId);
    // the event below was used for simulation and should be removed afterwards
    event VoteCastedFor(address voter, uint256 candidateId);

    constructor(address _voterRegistry) {
        voterRegistry = VoterRegistry(_voterRegistry);
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) internal {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function castVote(uint _candidateId) external {
        require(voterRegistry.isRegistered(msg.sender), "Not registered");
        require(!voteBatches[batchCount].votersInBatch[msg.sender], "Already voted in this batch");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        if (batchCount == 0) {
            batchCount++;
            voteBatches[batchCount].batchId = batchCount;
        }

        voteBatches[batchCount].voteIds.push(_candidateId);
        voteBatches[batchCount].votersInBatch[msg.sender] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCasted(batchCount, msg.sender, _candidateId);
    }

    // Additional getters
    function getBatchVoteIds(uint _batchId) external view returns (uint[] memory) {
    return voteBatches[_batchId].voteIds;
    }

    function isVoterInBatch(uint _batchId, address _voter) external view returns (bool) {
    return voteBatches[_batchId].votersInBatch[_voter];
    }

    function getCandidateVoteCount(uint _candidateId) external view returns (uint) {
    return candidates[_candidateId].voteCount;
    }
}