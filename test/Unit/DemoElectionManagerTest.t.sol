// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {DemoElectionManager} from "../../src/DemoElectionManager.sol";
import {VoterRegistry} from "../../src/VoterRegistry.sol";

contract DemoElectionManagerTest is Test {
    DemoElectionManager demoElectionManager;
    VoterRegistry voterRegistry;

    address admin = address(0x1);
    address voter = address(0x2);

    function setUp() public {
        vm.startPrank(admin);
        voterRegistry = new VoterRegistry();
        // Make voter eligible and registered
        voterRegistry.addEligibleVoter(voter);
        vm.stopPrank(); // end admin actions

        vm.startPrank(voter);
        voterRegistry.registerVoter();
        vm.stopPrank();
        demoElectionManager = new DemoElectionManager(address(voterRegistry));
    }


    function testDemoElectionsCreated() view public {
        DemoElectionManager.Election memory e1 = demoElectionManager.getElection(1);
        assertEq(e1.name, "Student Union Election 2025");
        assertEq(e1.zone, "LAUTECH");
        console.log(e1.name);
        console.log(e1.zone);

        DemoElectionManager.Election memory e2 = demoElectionManager.getElection(2);
        assertEq(e2.name, "NACOSS");
        assertEq(e2.zone, "South-West");
    }

    function testVoteInElection() public {
        uint[] memory cands = demoElectionManager.getElectionCandidates(1);
        assertEq(cands.length, 2);
        console.log(cands.length);

        vm.startPrank(voter);
        demoElectionManager.castVote(1, cands[0]);

        DemoElectionManager.Candidate memory cand = demoElectionManager.getCandidate(cands[0], 1);
        assertEq(cand.voteCount, 1);
        vm.stopPrank();
    }

    function testCannotVoteTwice() public {
        uint[] memory cands = demoElectionManager.getElectionCandidates(1);
        vm.prank(voter);
        demoElectionManager.castVote(1, cands[0]);

        vm.expectRevert("Already voted");
        vm.prank(voter);
        demoElectionManager.castVote(1, cands[0]);
    }
}