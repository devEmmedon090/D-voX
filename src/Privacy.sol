// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VoterRegistry} from "./VoterRegistry.sol";
import {ElectionManager} from "./ElectionManager.sol";

contract Privacy {
    VoterRegistry public voterRegistry;
    ElectionManager public electionManager;

    constructor(address _voterRegistry, address _electionManager) {
        voterRegistry = VoterRegistry(_voterRegistry);
        electionManager = ElectionManager(_electionManager);
    }

        function registerWithZkProof() external {
        // TODO: Use zk-SNARK library (e.g., Circom) to verify proof
        // input parameters for the function above: bytes calldata _proof, bytes32 _publicInput
        voterRegistry.registerVoterWithZkProof(msg.sender);
        // input parameters for the above declaration: _proof, _publicInput
    }

    // function registerWithZkProof() external {
    //     // TODO: Use zk-SNARK library (e.g., Circom) to verify proof
    //     // input parameters for the function above: bytes calldata _proof, bytes32 _publicInput
    //     voterRegistry.registerVoterWithZkProof();
    //     // input parameters for the above declaration: _proof, _publicInput
    // }

    function castAnonymousVote(bytes calldata _proof, uint _candidateId) external {
        // TODO: Verify proof ensures voter is registered and hasn't voted
    }
}