// This script makes a call to view all emissions of an event
const ethers = require('ethers');
require('dotenv').config({ path: '../.env' });

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

const contractAddress = process.argv[2];

// start from beginning of time if no arg provided
const startingBlock = parseInt(process.argv[3]) || 1;

const anchorAbi = require("../../build/contracts/Anchor.json");

// Get all emitted event information about deposits
async function readDeposits() {
  const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
  const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);
  const depositFilterResult = await anchorInstance.filters.Deposit();

  const currentBlock = await provider.getBlockNumber('latest');
  var logs = [];
  
  for (var i=startingBlock; i<currentBlock; i+=50)
  {
    // take the logs from a 1000 block range and append them to the logs variable
    logs = [ ...logs, ...(await provider.getLogs({
      fromBlock: i,
      toBlock: (currentBlock - i > 50) ? i + 50 : currentBlock,
      address: contractAddress,
      topics: [depositFilterResult.topics]
    }))];

    console.log(`Got logs for range: ${i} - ${i+50}`);
  }

  for (var i=0; i<logs.length; i++)
  {
    console.log(anchorInterface.parseLog(logs[i]));
  }
}

readDeposits();
