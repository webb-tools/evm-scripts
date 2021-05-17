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
    var atomicBalance = await provider.getBalance(address);
    var nativeBalance = ethers.utils.formatUnits(atomicBalance, process.env.DECIMALS);
    console.log(nativeBalance);
    return nativeBalance;
}

var address = process.argv[2];

viewBalance(address);

