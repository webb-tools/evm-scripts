const ethers = require("ethers");
require("dotenv").config({ path: '../.env' });

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

async function viewBlockByNumber(blockNumber) {
  var block = await provider.getBlock(blockNumber);
  console.log(block);
  return block;
}

var blockNumber = parseInt(process.argv[2]);

viewBlockByNumber(blockNumber);

