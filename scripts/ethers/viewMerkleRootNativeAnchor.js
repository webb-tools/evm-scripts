// This script makes a call to a solidity view function

const ethers = require("ethers");
const nativeAnchorAbi = require('../../build/contracts/NativeAnchor.json');
require('dotenv').config({ path: '../.env' });

const contractAddress = process.argv[2];

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

async function viewMerkleRoot() {
  const nativeAnchorInstance = new ethers.Contract(contractAddress, nativeAnchorAbi.abi, provider);
  const result = await nativeAnchorInstance.getLastRoot();
  console.log(result);
}

viewMerkleRoot();
