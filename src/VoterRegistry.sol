// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title A voter registration smart contract for a decentralized voting system
 * @author Emmanuel Ordor
 * @notice 
 */

contract VoterRegistry {
    address public admin;
    mapping(address => bool) public eligibleVoters;
    mapping(address => bool) public isRegistered;

    event VoterRegistered(address indexed voter);

    modifier onlyAdmin() {
        _onlyAdmin();
        _;
    }

    function _onlyAdmin() internal view{
        require(msg.sender == admin, "Only admin can call this");
    }

    constructor() {
        admin = msg.sender;
    }

    function addEligibleVoter(address _voter) external onlyAdmin {
        require(!eligibleVoters[_voter], "Voter already eligible");
        eligibleVoters[_voter] = true;
        emit VoterRegistered(_voter);
    }

    function registerVoter() external {
        require(eligibleVoters[msg.sender], "Not eligible");
        require(!isRegistered[msg.sender], "Already registered");
        isRegistered[msg.sender] = true;
        emit VoterRegistered(msg.sender);
    }

    function registerVoterWithZkProof(address voter) external {
        // TODO: Integrate zk-SNARK library (e.g., Circom) to verify proof
        // For now, this is a stub that assumes verification passes
        // input parameters: bytes calldata _proof, bytes32 _publicInput
        isRegistered[voter] = true;
        emit VoterRegistered(voter);
    }

    // function registerVoterWithZkProof() external {
    //     // TODO: Integrate zk-SNARK library (e.g., Circom) to verify proof
    //     // For now, this is a stub that assumes verification passes
    //     // input parameters: bytes calldata _proof, bytes32 _publicInput
    //     isRegistered[msg.sender] = true;
    //     emit VoterRegistered(msg.sender);
    // }
}