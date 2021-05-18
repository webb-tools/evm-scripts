// This script makes a call to view all emissions of an event
const Web3 = require('web3');
require('dotenv').config({ path: '../.env' });
const anchorAbi = require("../../build/contracts/Anchor.json");

let provider;

if (process.env.WEBSOCKETS) {
    provider = new Web3.providers.WebsocketProvider(`${process.env.ENDPOINT}`);
}
else {
    provider = new Web3.providers.HttpProvider(`${process.env.ENDPOINT}`);
}
const web3 = new Web3(provider);
const web3Account = web3.eth.accounts.privateKeyToAccount(`${process.env.PRIVATE_KEY}`);

const contractAddress = process.argv[2];

// Get all emitted event information about deposits
async function readDeposits() {

    const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
    const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);

    const depositFilterResult = await anchorInstance.filters.Deposit();

    const logs = await provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        address: contractAddress,
        topics: [depositFilterResult.topics]
    });

    for (var i=0; i<logs.length; i++)
    {
        console.log(anchorInterface.parseLog(logs[i]));
    }
}

readDeposits();
