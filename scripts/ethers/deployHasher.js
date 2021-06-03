require("dotenv").config({ path: '../.env' });
const ethers = require("ethers");
const genContract = require('circomlib/src/mimcsponge_gencontract.js');

const hasherContractRaw = {
  contractName: 'Hasher',
  abi: genContract.abi,
  bytecode: genContract.createCode('mimcsponge', 220),
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

async function deployHasher() {
  const hasherFactory = new ethers.ContractFactory(hasherContractRaw.abi, hasherContractRaw.bytecode, wallet);
  let hasherInstance = await hasherFactory.deploy({gasLimit: '0x5B8D80'});
  const hasherAddress = await hasherInstance.deployed();

  console.log(hasherAddress.address);
  process.exit();
}

deployHasher();
