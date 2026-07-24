# Makefile for D-voX project
# Variables loaded from .env
include .env
export $(shell sed 's/=.*//' .env)

# Default Foundry binary and fallback values
FOUNDRY_BIN := forge
RPC_URL_ANVIL ?= http://127.0.0.1:8545
RPC_URL_SEPOLIA ?= https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
SENDER ?= 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
PRIVATE_KEY ?= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
VOTER_REGISTRY_ADDR ?= 0x5FbDB2315678afecb367f032d93F642f64180aa3
ELECTION_MANAGER_ADDR ?= 0xe7f1725e7734ce288f8367e1bb143e90bb3f0512
ETHERSCAN_API_KEY ?= YOUR_ETHERSCAN_API_KEY

# Default target
all: build test

# Build contracts
build:
	$(FOUNDRY_BIN) build

# Run tests
test:
	$(FOUNDRY_BIN) test

# Deploy to Anvil
deploy-anvil:
	$(FOUNDRY_BIN) script script/DeployAll.s.sol --rpc-url $(RPC_URL_ANVIL) --broadcast --sender $(SENDER) --private-key $(PRIVATE_KEY)

# Deploy to Sepolia
deploy-sepolia:
	$(FOUNDRY_BIN) script script/DeployAll.s.sol --rpc-url $(RPC_URL_SEPOLIA) --broadcast --sender $(SEPOLIA_SENDER) --private-key $(SEPOLIA_PRIVATE_KEY)

# Deploy Demo Election to Sepolia
deploy-demo-election-sepolia:
	$(FOUNDRY_BIN) script script/DeployDemo.s.sol --rpc-url $(RPC_URL_SEPOLIA) --sender $(SEPOLIA_SENDER) --private-key $(SEPOLIA_PRIVATE_KEY) --broadcast

# Simulate voters on AnvilSEPOLIA_PRIVATE_KEY
simulate-voters:
	$(FOUNDRY_BIN) script script/SimulateVoters.s.sol --rpc-url $(RPC_URL_ANVIL) --broadcast --sender $(SENDER) --private-key $(PRIVATE_KEY)

# Clean artifacts and cache
clean:
	rm -rf out cache

# Verify contract on Etherscan (for Sepolia)
verify-sepolia:
	$(FOUNDRY_BIN) verify-contract $(VOTER_REGISTRY_ADDR) src/VoterRegistry.sol:VoterRegistry --chain sepolia --etherscan-api-key $(ETHERSCAN_API_KEY)
	$(FOUNDRY_BIN) verify-contract $(ELECTION_MANAGER_ADDR) src/ElectionManager.sol:ElectionManager --chain sepolia --constructor-args $(shell cast abi-encode "constructor(address)" $(VOTER_REGISTRY_ADDR)) --etherscan-api-key $(ETHERSCAN_API_KEY)

# Verify demoELectionManager on sepolia
verify-sepolia-demoELectionManager:
	$(FOUNDRY_BIN) verify-contract $(DEMO_ELECTION_MANAGER_ADDR) src/DemoElectionManager.sol:DemoElectionManager --chain sepolia --constructor-args $(shell cast abi-encode "constructor(address)" $(VOTER_REGISTRY_ADDR)) --etherscan-api-key $(ETHERSCAN_API_KEY)

# Help target to list available commands
help:
	@echo "Available commands:"
	@echo "  make          - Build and test (default)"
	@echo "  make build    - Compile contracts"
	@echo "  make test     - Run tests"
	@echo "  make deploy-anvil - Deploy to Anvil"
	@echo "  make deploy-sepolia - Deploy to Sepolia"
	@echo "  make simulate-voters - Run voter simulation on Anvil"
	@echo "  make clean    - Clean artifacts and cache"
	@echo "  make verify-sepolia - Verify contracts on Etherscan (Sepolia)"
	@echo "  make help     - Show this help message"

.PHONY: all build test deploy-anvil deploy-sepolia simulate-voters clean verify-sepolia help