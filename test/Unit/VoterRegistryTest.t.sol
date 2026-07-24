// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VoterRegistry} from "../../src/VoterRegistry.sol";

contract VoterRegistryTest is Test {
    VoterRegistry voterRegistry;
    address admin;
    address voter1 = address(0x1);
    address voter2 = address(0x2);

    function setUp() public {
        voterRegistry = new VoterRegistry();
        admin = voterRegistry.admin();
    }

    function testInitialAdmin() public view {
        assertEq(admin, address(this));
    }

    function testAddEligibleVoter() public {
        voterRegistry.addEligibleVoter(voter1);
        assertTrue(voterRegistry.eligibleVoters(voter1));
    }

    function test_RevertWhen_AddEligibleVoterAlreadyEligible() public {
        voterRegistry.addEligibleVoter(voter1);
        // Expect revert with message
        vm.expectRevert(bytes("Voter already eligible"));
        voterRegistry.addEligibleVoter(voter1);
    }

    function test_RevertWhen_NonAdminAddEligibleVoter() public {
        vm.prank(voter1);
        vm.expectRevert(bytes("Only admin can call this"));
        voterRegistry.addEligibleVoter(voter2);
    }

    function testRegisterVoter() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        assertTrue(voterRegistry.isRegistered(voter1));
    }

    function test_RevertWhen_RegisterVoterNotEligible() public {
        vm.prank(voter1);
        vm.expectRevert(bytes("Not eligible"));
        voterRegistry.registerVoter();
    }

    function test_RevertWhen_RegisterVoterAlreadyRegistered() public {
        voterRegistry.addEligibleVoter(voter1);
        vm.prank(voter1);
        voterRegistry.registerVoter();
        // Excpect a revert
        vm.expectRevert(bytes("Already registered"));
        vm.prank(voter1);
        voterRegistry.registerVoter();
    }

        function testRegisterVoterWithZkProof() public {
        // bytes memory proof = new bytes(0);
        // bytes32 publicInput = bytes32(0);
        vm.prank(voter1);
        voterRegistry.registerVoterWithZkProof(voter1);
        // input parameters: proof, publicInput
        assertTrue(voterRegistry.isRegistered(voter1));
    }

    // function testRegisterVoterWithZkProof() public {
    //     // bytes memory proof = new bytes(0);
    //     // bytes32 publicInput = bytes32(0);
    //     vm.prank(voter1);
    //     voterRegistry.registerVoterWithZkProof();
    //     // input parameters: proof, publicInput
    //     assertTrue(voterRegistry.isRegistered(voter1));
    // }
}