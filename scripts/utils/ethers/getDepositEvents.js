const ethers = require("ethers");
require("dotenv").config({ path: '../../../.env' });
const anchorAbi = require("../../../build/contracts/Anchor.json");

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

module.exports = async function getDepositEvents(contractAddress) {
  // Query the blockchain for all deposits that have happened
  const anchorInterface = new ethers.utils.Interface(anchorAbi.abi);
  const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, provider);
  const depositFilterResult = await anchorInstance.filters.Deposit();
  const currentBlock = await provider.getBlockNumber('latest');

  const logs = await provider.getLogs({
    fromBlock: (currentBlock - 1000),
    toBlock: currentBlock,
    address: contractAddress,
    topics: [depositFilterResult.topics]
  });

  // Decode the logs for deposit events
  const decodedEvents = await logs.map(log => {
    return anchorInterface.parseLog(log);
  })

  return decodedEvents;
}

