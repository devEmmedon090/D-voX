// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ElectionManager} from "../../src/ElectionManager.sol";
import {VoterRegistry} from "../../src/VoterRegistry.sol";

contract ElectionManagerTest is Test {
    VoterRegistry voterRegistry;
    ElectionManager electionManager;
    address voter1 = address(0x1);

    function setUp() public {
        voterRegistry = new VoterRegistry();
        electionManager = new ElectionManager(address(voterRegistry));
    }

    function testInitialCandidates() public view {
        assertEq(electionManager.candidatesCount(), 2);
        (uint id, string memory name, uint voteCount) = electionManager.candidates(1);
        assertEq(id, 1);
        assertEq(name, "Candidate 1");
        assertEq(voteCount, 0);
    }

    function testCastVote() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        electionManager.castVote(1);
        assertEq(electionManager.batchCount(), 1);
        uint[] memory votes = electionManager.getBatchVoteIds(1);
        assertEq(votes[0], 1);
        ( , , uint voteCount) = electionManager.candidates(1);
        assertEq(voteCount, 1);
    }

    function test_RevertWhen_CastVoteNotRegistered() public {
        vm.prank(voter1);
        vm.expectRevert(bytes("Not registered"));
        electionManager.castVote(1);
    }

    function test_RevertWhen_CastVoteAlreadyVoted() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        electionManager.castVote(1);
        // Expect A revert
        vm.expectRevert(bytes("Already voted in this batch"));
        vm.prank(voter1);
        electionManager.castVote(2);
    }

    function test_RevertWhen_CastVoteInvalidCandidate() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        vm.prank(voter1);
        //Expect Revert
        vm.expectRevert(bytes("Invalid candidate"));
        electionManager.castVote(999);
    }
}