// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Privacy} from "../../src/Privacy.sol";
import {VoterRegistry} from "../../src/VoterRegistry.sol";
import {ElectionManager} from "../../src/ElectionManager.sol";

contract PrivacyTest is Test {
    VoterRegistry voterRegistry;
    ElectionManager electionManager;
    Privacy privacy;
    address voter1 = address(0x1);

    function setUp() public {
        voterRegistry = new VoterRegistry();
        privacy = new Privacy(address(voterRegistry), address(electionManager));
    }

        function testRegisterWithZKProof() public {
        // bytes memory proof = new bytes(0);
        // bytes32 publicInput = bytes32(0);
        vm.prank(voter1);
        privacy.registerWithZkProof();
        // input parameter for the above function: proof, publicInput
        bool isRegistered = voterRegistry.isRegistered(voter1);
        assertTrue(isRegistered);
    }

    // function test_RegisterWithZKProof() public {
    //     // bytes memory proof = new bytes(0);
    //     // bytes32 publicInput = bytes32(0);
    //     vm.prank(voter1);
    //     privacy.registerWithZkProof();
    //     // input parameter for the above function: proof, publicInput
    //     bool isRegistered = voterRegistry.isRegistered(voter1);
    //     assertTrue(isRegistered);
    // }

    function testCastAnonymousVote() public {
        bytes memory proof = new bytes(0);
        vm.prank(voter1);
        privacy.castAnonymousVote(proof, 1);
    }
}