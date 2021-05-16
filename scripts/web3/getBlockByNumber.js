// Script to get the block at the number provided in through the CLI,
// `node getBlock.js <number>`
require("dotenv").config({ path: '../.env'});
const Web3 = require('web3');

let provider;

if (!process.env.WEBSOCKETS) {
    provider = new Web3.providers.HttpProvider(`${process.env.ENDPOINT}`);
}
else {
    provider = new Web3.providers.WebsocketProvider(`${process.env.ENDPOINT}`);
}

const web3 = new Web3(provider);

var blockNumber = process.argv[2];
var output;

async function getBlockByNumber() {
    output = await web3.eth.getBlock(blockNumber);
    console.log(output);
}

getBlockByNumber()
