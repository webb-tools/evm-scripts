const ethers = require('ethers');
require('dotenv').config({ path: '../.env' });

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}
const merkleAbi = require("../../build/contracts/MerkleTreeWithHistory.json");
const contractAddress = process.argv[2];

// Print out all the merkle roots
async function viewHasher() {
  const merkleInstance = new ethers.Contract(contractAddress, merkleAbi.abi, provider);

  const hasher = await merkleInstance.functions.hasher();

  console.log(hasher);
}

viewHasher();
