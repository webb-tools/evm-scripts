// This script makes a call to view all emissions of an event
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
require('dotenv').config({ path: '../.env' });
const anchorAbi = require("../../build/contracts/Anchor.json");

let provider = new HDWalletProvider({
  providerOrUrl: `${process.env.ENDPOINT}`,
  privateKeys: [`${process.env.PRIVATE_KEY}`],
});

const web3 = new Web3(provider);

const contractAddress = process.argv[2];

// Get all emitted event information about deposits
async function readDeposits() {
  const anchorInstance = new web3.eth.Contract(anchorAbi.abi, contractAddress);

  const logs = await anchorInstance.getPastEvents('Deposit', {
    fromBlock: 0,
    toBlock: 'latest'
  });

  console.log(logs);
}

readDeposits();
provider.engine.stop();
