// Script to get the block at the number provided in through the CLI,
// `node getBlock.js <number>`
require("dotenv").config({ path: '../.env'});
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

let provider = new HDWalletProvider({
  providerOrUrl: `${process.env.ENDPOINT}`,
  privateKeys: [`${process.env.PRIVATE_KEY}`],
});

const web3 = new Web3(provider);

var blockNumber = process.argv[2];
var output;

async function viewBlockByNumber() {
  output = await web3.eth.getBlock(blockNumber);
  console.log(output);
}

viewBlockByNumber();
provider.engine.stop();
