require('dotenv').config();
const { ethers } = require('ethers');

// === CONFIG ===
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';  // Admin key
const RPC_URL = 'https://eth-sepolia.g.alchemy.com/v2/oED6dKLPbgYYFaMR9Xqcm';
const CONTRACT_ADDRESS = '0x5db6221c8d503eb09e7c6423b7a2901788f86c81';
const VOTER_ADDRESS = '0xF7E201D5142fc0dA5e0267EC337400880Ddd53Fb';   // ← NEW ONE
// =================================

const abi = [
  "function addEligibleVoter(address _voter) external"
];

async function addVoter() {
  console.log('🔗 Connecting to Alchemy...');
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('✅ Admin wallet:', wallet.address);

  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);
  console.log('📡 Adding voter:', VOTER_ADDRESS);

  const tx = await contract.addEligibleVoter(VOTER_ADDRESS);
  console.log('⏳ Tx sent:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('✅ Voter added! Block:', receipt.blockNumber);
  console.log('📜 Tx explorer: https://sepolia.etherscan.io/tx/' + tx.hash);
}

addVoter().catch(console.error);
