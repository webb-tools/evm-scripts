// This script makes a call to view all emissions of an event
const Web3 = require('web3');
require('dotenv').config({ path: '../.env' });
const anchorAbi = require("../../build/contracts/Anchor.json");

let provider;

if (process.env.WEBSOCKETS) {
  provider = new Web3.providers.WebsocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new Web3.providers.HttpProvider(`${process.env.ENDPOINT}`);
}
const web3 = new Web3(provider);

// Get all emitted event information about deposits
module.exports = async function readDeposits(contractAddress) {
  const anchorInstance = new web3.eth.Contract(anchorAbi.abi, contractAddress);

  const logs = await anchorInstance.getPastEvents('Deposit', {
    fromBlock: 0,
    toBlock: 'latest'
  });

  return logs;
}
