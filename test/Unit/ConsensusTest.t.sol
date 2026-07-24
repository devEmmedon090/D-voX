// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Consensus} from "../../src/Consensus.sol";
import {ElectionManager} from "../../src/ElectionManager.sol";
import {VoterRegistry} from "../../src/VoterRegistry.sol";

contract ConsensusTest is Test {
    VoterRegistry voterRegistry;
    ElectionManager electionManager;
    Consensus consensus;
    address voter1 = address(0x1);

    function setUp() public {
        voterRegistry = new VoterRegistry();
        electionManager = new ElectionManager(address(voterRegistry));
        consensus = new Consensus(address(electionManager));
    }

    function testConfirmBatchConsensus() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        electionManager.castVote(1);
        consensus.confirmBatchConsensus(1);
        assertTrue(consensus.batchConsensusReached(1));
    }

    function test_RevertWhen_ConfirmBatchConsensusInvalidBatch() public {
        vm.expectRevert(bytes("Invalid batch"));
        consensus.confirmBatchConsensus(999);
    }

    function test_RevertWhen_ConfirmBatchConsensusAlreadyReached() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        electionManager.castVote(1);
        consensus.confirmBatchConsensus(1);
        vm.expectRevert(bytes("Consensus already reached"));
        consensus.confirmBatchConsensus(1);
    }

    function testFinalizeElection() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        electionManager.castVote(1);
        consensus.confirmBatchConsensus(1);
        consensus.finalizeElection();
    }

    function test_RevertWhen_FinalizeElectionUnconfirmedBatches() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        electionManager.castVote(1);
        //Expect Revert
        vm.expectRevert(bytes("Not all batches confirmed"));
        consensus.finalizeElection();
    }
}