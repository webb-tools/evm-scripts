require("dotenv").config({ path: '../.env' });
const ethers = require("ethers");
const storageExampleContract = require('../../build/contracts/StorageExample.json');

let provider;

if (process.env.WEBSOCKETS) {
    provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
    provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
async function deployStorageExample() {
    const storageExampleFactory = new ethers.ContractFactory(storageExampleContract.abi, storageExampleContract.bytecode, wallet);
    let storageExampleInstance = await storageExampleFactory.deploy('hello world');
    await storageExampleInstance.deployed();

    console.log(storageExampleInstance.address);
    process.exit();
}

deployStorageExample()
