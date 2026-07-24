// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DemoElectionManager} from "../src/DemoElectionManager.sol";
import {VoterRegistry} from "../src/VoterRegistry.sol";

contract DeployDemo is Script {
    VoterRegistry public voterRegistry;
    function run() external {
        // uint256 deployerKey = vm.envUint("c2cfce8170539fe5b00b5d6f69123aaec035bf0a17003af1cdeecdc1dd2d9a5e");
        vm.startBroadcast();  //(deployerKey)

        //Deploy the voter registry first
        voterRegistry = new VoterRegistry();
        console.log("VoterRegistry deployed to:", address(voterRegistry));

        DemoElectionManager demoElectionManager = new DemoElectionManager(address(voterRegistry));

        vm.stopBroadcast();
        console.log("ElectionManager deployed to:", address(demoElectionManager));
    }
}