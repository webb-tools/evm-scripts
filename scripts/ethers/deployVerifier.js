require("dotenv").config({ path: '../.env' });
const ethers = require("ethers");
const verifierContract = require('../../build/contracts/Verifier.json');

const verifierContractRaw = {
  contractName: 'Verifier',
  abi: verifierContract.abi,
  bytecode: verifierContract.bytecode,
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

async function deployVerifier() {
  const verifierFactory = new ethers.ContractFactory(verifierContractRaw.abi, verifierContractRaw.bytecode, wallet);
  let verifierInstance = await verifierFactory.deploy({gasLimit: '0x5B8D80'});
  const verifierAddress = await verifierInstance.deployed();

  console.log(verifierAddress.address);
  process.exit();
}

deployVerifier();
