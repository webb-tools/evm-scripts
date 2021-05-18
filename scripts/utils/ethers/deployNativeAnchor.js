require("dotenv").config({ path: '../../../.env' }); //.env path is dependent upon where the script is run.
const ethers = require("ethers");
const genContract = require('circomlib/src/mimcsponge_gencontract.js');
const verifierContract = require('../../../build/contracts/Verifier.json');
const nativeAnchorContract = require('../../../build/contracts/NativeAnchor.json');

const hasherContractRaw = {
  contractName: 'Hasher',
  abi: genContract.abi,
  bytecode: genContract.createCode('mimcsponge', 220),
};

const verifierContractRaw = {
    contractName: 'Verifier',
    abi: verifierContract.abi,
    bytecode: verifierContract.bytecode,
};

const nativeAnchorContractRaw = {
    contractName: 'NativeAnchor',
    abi: nativeAnchorContract.abi,
    bytecode: nativeAnchorContract.bytecode,
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

async function deployNativeAnchor() {
    const hasherFactory = new ethers.ContractFactory(hasherContractRaw.abi, hasherContractRaw.bytecode, wallet);
    let hasherInstance = await hasherFactory.deploy();
    await hasherInstance.deployed();

    const verifierFactory = new ethers.ContractFactory(verifierContractRaw.abi, verifierContractRaw.bytecode, wallet);
    let verifierInstance = await verifierFactory.deploy();
    await verifierInstance.deployed();
    
    const denomination = ethers.BigNumber.from("100000000000000000");
    const merkleTreeHeight = 20;
    const nativeAnchorFactory = new ethers.ContractFactory(nativeAnchorContractRaw.abi, nativeAnchorContractRaw.bytecode, wallet);
    let nativeAnchorInstance = await nativeAnchorFactory.deploy(verifierInstance.address, hasherInstance.address, denomination, merkleTreeHeight);
    await nativeAnchorInstance.deployed();

    return nativeAnchorInstance.address;
}

module.exports = deployNativeAnchor;
