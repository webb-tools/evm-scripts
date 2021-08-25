require("dotenv").config({ path: '../.env' });
const BigNumber = require('bignumber.js');
const ethers = require("ethers");
const WEBBContract = require('../../build/contracts/WEBB.json');

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

if (!process.argv[2] || !ethers.utils.isAddress(process.argv[2])) {
  console.log("webb token address required as first parameter");
  return;
}

if (!process.argv[3] || !ethers.utils.isAddress(process.argv[3])) {
  console.log("minted token recipient address required as second parameter");
  return;
}

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

async function mintTokensTo(tokenAddress, userAddress) {
  const webbTokenContract = new ethers.Contract(tokenAddress, WEBBContract.abi, wallet);
  // 10^23 tokens, or 100,000
  await webbTokenContract.mint(userAddress, ethers.BigNumber.from("1000000000000000000000000"));
  console.log(`token at: ${tokenAddress} minted 100,000 to: ${userAddress}`)
}

mintTokensTo(process.argv[2], process.argv[3]);
