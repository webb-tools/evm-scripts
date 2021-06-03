// This script makes a call to view all emissions of an event
const ethers = require('ethers');
require('dotenv').config({ path: '../.env' });

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

const contractAddress = process.argv[2];
const anchorAbi = require("../../build/contracts/Anchor.json");

// Get all emitted event information about deposits
function listenDeposits() {
  const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);

  anchorInstance.on("Deposit", (_commitment) => {
    console.log(`a deposit was made with ${_commitment}`);
  })
}

listenDeposits();
