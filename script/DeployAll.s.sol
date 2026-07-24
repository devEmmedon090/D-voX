// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {VoterRegistry} from "../src/VoterRegistry.sol";
import {ElectionManager} from "../src/ElectionManager.sol";
import {Consensus} from "../src/Consensus.sol";
import {Privacy} from "../src/Privacy.sol";
import {Audit} from "../src/Audit.sol";

contract DeployAll is Script {
    function run() external {
        vm.startBroadcast();

        VoterRegistry voterRegistry = new VoterRegistry();

        ElectionManager electionManager = new ElectionManager(address(voterRegistry));

        new Consensus(address(electionManager));    // Consensus consensus =

        new Privacy(address(voterRegistry), address(electionManager));    //Privacy privacy = 

        new Audit(address(electionManager));   // Audit audit =

        vm.stopBroadcast();
    }
}