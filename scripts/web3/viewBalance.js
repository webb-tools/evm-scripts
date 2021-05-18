// Script to get the current balance of the address provided in through the CLI,
// `node getBalance.js <address>`
require("dotenv").config({ path: '../.env' });
const Web3 = require('web3');

let provider;

if (process.env.WEBSOCKETS) {
    provider = new Web3.providers.WebsocketProvider(`${process.env.ENDPOINT}`);
}
else {
    provider = new Web3.providers.HttpProvider(`${process.env.ENDPOINT}`);
}

const web3 = new Web3(provider);
var address = process.argv[2];

async function viewBalance() {
    output = await web3.eth.getBalance(address);
    console.log(output);
}

viewBalance()
