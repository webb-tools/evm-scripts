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
var address = process.argv[2] || '0x6be02d1d3665660d22ff9624b7be0551ee1ac91b';

async function viewBalance() {
  output = await web3.eth.getBalance(address);
  console.log(output);
}

viewBalance()
provider.engine.stop();
