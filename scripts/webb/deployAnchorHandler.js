require("dotenv").config({ path: '../.env' });
const BigNumber = require('bignumber.js');
const ethers = require("ethers");
const anchorHandlerContract = require('../../build/contracts/AnchorHandler.json');

const anchorHandlerContractRaw = {
  contractName: 'Bridge',
  abi: anchorHandlerContract.abi,
  bytecode: anchorHandlerContract.bytecode,
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

async function deployAnchorHandler() {
  const bridgeAddress = "0xd961d7Cf4d001EC57ff3F6F9F6428B73b7d924Bc";
  const initResourceIds = "0x0000000000000000000000c7ea8de882aefa121c5d527c546403217dd4130004"
  const initContractAddresses = "0xC7eA8DE882AEFa121C5D527C546403217dd41300"

  const anchorHandlerFactory = new ethers.ContractFactory(anchorHandlerContractRaw.abi, anchorHandlerContractRaw.bytecode, wallet);
  const anchorHandler = await anchorHandlerFactory.deploy(bridgeAddress, [initResourceIds], [initContractAddresses]);
  await anchorHandler.deployed();
  console.log(`Deployed AnchorHandler: ${anchorHandler.address}`);
}

deployAnchorHandler();