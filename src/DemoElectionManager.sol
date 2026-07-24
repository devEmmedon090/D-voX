// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VoterRegistry} from "./VoterRegistry.sol";

contract DemoElectionManager {
    VoterRegistry public voterRegistry;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
        string ipfsHash;
    }

    struct Election {
        uint id;
        string name;
        uint startTime;
        uint endTime;
        bool active;
        string zone;
        string electionType;
        uint[] candidateIds;
    }

    // MODULAR: Nested candidates per election
    mapping(uint => mapping(uint => Candidate)) public candidates;  // electionId => candidateId => Candidate
    mapping(uint => uint) public candidateCountPerElection;         // electionId => count

    mapping(uint => Election) public elections;
    uint public electionCount;

    mapping(uint => mapping(address => bool)) public hasVoted; // electionId => voter => voted

    event ElectionCreated(uint id, string name, string zone, string electionType);
    event CandidateAdded(uint electionId, uint candidateId, string name);
    event Voted(uint electionId, address voter, uint candidateId);

    constructor(address _voterRegistry) {
        voterRegistry = VoterRegistry(_voterRegistry);

        // Create 2 demo elections
        _createElection("Student Union Election 2025", 7 days, "LAUTECH", "Student");
        _createElection("NACOSS", 3 days, "South-West", "Coop");
    }

    function _createElection(string memory _name, uint _duration, string memory _zone, string memory _electionType) internal {
        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            name: _name,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            active: true,
            zone: _zone,
            electionType: _electionType,
            candidateIds: new uint[](0)
        });

        // Add candidates
        _addCandidate(electionCount, "Emmanuel", "ipfs://bafkreihsw75r4xjnjx47it2etliwt76w5fiydvak6uyp4ub25noc6aw6im");
        _addCandidate(electionCount, "Benjamin", "ipfs://bafkreibwpw22zu4yng5p5m3wfgnsecclwfakxw4o3og77xl7sr4tjctdje");

        emit ElectionCreated(electionCount, _name, _zone, _electionType);
    }

    // MODULAR: Local candidate ID per election
    function _addCandidate(uint _electionId, string memory _name, string memory _ipfsHash) internal {
        uint candidateId = ++candidateCountPerElection[_electionId];  // Local ID: 1,2,...
        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            voteCount: 0,
            ipfsHash: _ipfsHash
        });
        elections[_electionId].candidateIds.push(candidateId);
        emit CandidateAdded(_electionId, candidateId, _name);
    }

    function castVote(uint _electionId, uint _candidateId) external {
        Election storage election = elections[_electionId];
        require(election.active, "Election not active");
        require(block.timestamp >= election.startTime, "Not started");
        require(block.timestamp <= election.endTime, "Ended");
        require(voterRegistry.isRegistered(msg.sender), "Not registered");
        require(voterRegistry.eligibleVoters(msg.sender), "Not eligible");
        require(!hasVoted[_electionId][msg.sender], "Already voted");

        // Verify candidate exists in this election
        bool valid = false;
        for (uint i = 0; i < election.candidateIds.length; i++) {
            if (election.candidateIds[i] == _candidateId) {
                valid = true;
                break;
            }
        }
        require(valid, "Invalid candidate");

        // MODULAR: Increment correct voteCount
        candidates[_electionId][_candidateId].voteCount++;
        hasVoted[_electionId][msg.sender] = true;
        emit Voted(_electionId, msg.sender, _candidateId);
    }

    // View functions
    function getElection(uint _id) external view returns (Election memory) {
        return elections[_id];
    }

    function getElectionCandidates(uint _electionId) external view returns (uint[] memory) {
        return elections[_electionId].candidateIds;
    }

    function getCandidate(uint _electionId, uint _candidateId) external view returns (Candidate memory) {
        return candidates[_electionId][_candidateId];
    }

    function isRegistered(address voter) external view returns (bool) {
        return voterRegistry.isRegistered(voter);
    }

    function registerVoter() external {
        voterRegistry.registerVoter();
    }
}