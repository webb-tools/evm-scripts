const ethers = require('ethers');
require('dotenv').config({ path: '../.env' });

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}
const anchorAbi = require("../../build/contracts/Anchor.json");
const contractAddress = process.argv[2];

// Print out all the merkle roots
async function readVerifier() {
  const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);

  const verifierAddress = await anchorInstance.functions.verifier();

  console.log(verifierAddress);
}

readVerifier();
