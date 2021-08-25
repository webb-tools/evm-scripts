require("dotenv").config({ path: '../.env' });
const BigNumber = require('bignumber.js');
const ethers = require("ethers");
const bridgeContract = require('../../build/contracts/Bridge.json');

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

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const delay = '345600';

let receipt;

async function deployWebbBridge() {
  const initialRelayer = "0x48D41E139D3133F1879Ce5080b9C2CB4878332c2";
  const initRelayerThreshold = 1;
  const chainId = 4;
  // not sure what the fee is for
  const fee = 0;
  // Proposals live for 30 blocks
  const expiry = 30;

  const bridgeFactory = new ethers.ContractFactory(bridgeContractRaw.abi, bridgeContractRaw.bytecode, wallet);
  const deployedBridge = await bridgeFactory.deploy(chainId, [initialRelayer], initRelayerThreshold, fee, expiry);
  await deployedBridge.deployed();
  console.log(`Deployed Bridge: ${deployedBridge.address}`);

}

deployWebbBridge();