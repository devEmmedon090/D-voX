// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Audit} from "../../src/Audit.sol";
import {ElectionManager} from "../../src/ElectionManager.sol";
import {VoterRegistry} from "../../src/VoterRegistry.sol";

contract AuditTest is Test {
    VoterRegistry voterRegistry;
    ElectionManager electionManager;
    Audit audit;
    address voter1 = address(0x1);

    function setUp() public {
        voterRegistry = new VoterRegistry();
        electionManager = new ElectionManager(address(voterRegistry));
        audit = new Audit(address(electionManager));
    }

    function testGetBatchVotes() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        electionManager.castVote(1);
        uint[] memory votes = audit.getBatchVotes(1);
        assertEq(votes.length, 1);
        assertEq(votes[0], 1);
    }

    function testVerifyVoterVote() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        electionManager.castVote(1);
        assertTrue(audit.verifyVoters(voter1, 1));
    }

    function testGetCandidateVoteCount() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        electionManager.castVote(1);
        uint voteCount = audit.getCandidateVoteCount(1);
        assertEq(voteCount, 1);
    }
}