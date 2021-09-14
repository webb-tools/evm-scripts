require("dotenv").config({ path: '../.env' });
const BigNumber = require('bignumber.js');
const ethers = require("ethers");
const bridgeContract = require('../../build/contracts/Bridge.json');
const createResourceID = require('../utils/webb/createResourceId');

const bridgeContractRaw = {
  contractName: 'Bridge',
  abi: bridgeContract.abi,
  bytecode: bridgeContract.bytecode,
};

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

if (!process.argv[2] || !ethers.utils.isAddress(process.argv[2])) {
  console.log("Contract Address required as first parameter");
  return;
}

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function setResourceId(anchorAddress) {
  const bridgeContract = new ethers.Contract("0xd961d7Cf4d001EC57ff3F6F9F6428B73b7d924Bc", bridgeContractRaw.abi, wallet);
  const chainId = await wallet.getChainId();
  const resourceId = createResourceID(anchorAddress, chainId);

  await bridgeContract.adminSetResource("0x21D2Fee6f75f3541578D248C01ABF4A018b9d175", resourceId, anchorAddress);
}

setResourceId(process.argv[2]);
