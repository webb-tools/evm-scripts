const ethers = require("ethers");
require("dotenv").config({ path: '../.env' });

let provider;

if (process.env.WEBSOCKETS) {
    provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
    provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

async function viewBalance(address) {
    var weiBalance = await provider.getBalance(address);
    var etherBalance = ethers.utils.formatEther(weiBalance);
    console.log(etherBalance);
    return etherBalance;
}

var address = process.argv[2];

viewBalance(address);

