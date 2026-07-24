// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VoterRegistry} from "../src/VoterRegistry.sol";
import {ElectionManager} from "../src/ElectionManager.sol";

contract SimulateVoters is Script {
    function run() external {
        // Admin/deployer
        address admin = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

        // ======= SETUP ======= start as admin
        vm.startBroadcast(admin);
        VoterRegistry voterRegistry = VoterRegistry(0x5FbDB2315678afecb367f032d93F642f64180aa3);
        ElectionManager electionManager = ElectionManager(0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512);

        console.log("Admin (deployer):", voterRegistry.admin());

        // ======= ADMIN ADDS ELIGIBLE VOTERS =======
        for (uint i = 0; i < 100; i++) {
            // generate pseudo-random deterministic voter addresses
            address voter = address(uint160(uint256(keccak256(abi.encodePacked(i)))));
            voterRegistry.addEligibleVoter(voter);
        }

        console.log("100 voters marked eligible by admin");

        vm.stopBroadcast();

        // ======= VOTERS REGISTER THEMSELVES AND VOTE =======
        for (uint i = 0; i < 100; i++) {
            address voter = address(uint160(uint256(keccak256(abi.encodePacked(i)))));
            vm.startBroadcast(voter);

            // register themselves
            voterRegistry.registerVoter();

            // choose a random candidate (1 or 2)
            uint candidateId = (uint256(keccak256(abi.encodePacked(voter, block.timestamp))) % 2) + 1;
            electionManager.castVote(candidateId);

            vm.stopBroadcast();

            console.log("Voter", voter, "registered and voted for candidate", candidateId);
        }

        // Step 4: Print results
        uint candidate1Votes = electionManager.getCandidateVoteCount(1);
        uint candidate2Votes = electionManager.getCandidateVoteCount(2);
        console.log("Candidate 1 votes:", candidate1Votes);
        console.log("Candidate 2 votes:", candidate2Votes);
        console.log("Simulation complete. Total votes cast:", candidate1Votes + candidate2Votes);
        console.log("Simulation complete. 100 voters registered and voted!");
    }
}
