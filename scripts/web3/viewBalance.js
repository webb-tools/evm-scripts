// Script to get the current balance of the address provided in through the CLI,
// `node getBalance.js <address>`
require("dotenv").config({ path: '../.env' });
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

let provider = new HDWalletProvider({
  providerOrUrl: `${process.env.ENDPOINT}`,
  privateKeys: [`${process.env.PRIVATE_KEY}`],
});

const web3 = new Web3(provider);
var address = process.argv[2];

async function viewBalance() {
  output = await web3.eth.getBalance(address);
  console.log(output);
}

viewBalance()
provider.engine.stop();
