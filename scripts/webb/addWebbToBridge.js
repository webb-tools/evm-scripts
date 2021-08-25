require("dotenv").config({ path: '../.env' });
const BigNumber = require('bignumber.js');
const ethers = require("ethers");

const linkableAnchorContract = require('../../build/contracts/LinkableAnchor2.json');

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

if (!process.argv[2] || !ethers.utils.isAddress(process.argv[2])) {
  console.log("anchor Address required as first parameter");
  return;
}

if (!process.argv[3] || !ethers.utils.isAddress(process.argv[3])) {
  console.log("bridge Address required as second parameter");
  return;
}

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);



