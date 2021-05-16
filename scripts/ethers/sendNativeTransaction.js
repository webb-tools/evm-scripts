const ethers = require("ethers");
require("dotenv").config({ path: '../.env' });

let provider;

if (process.env.WEBSOCKETS) {
    provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
    provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function sendTransaction() {
    const signedTx = await wallet.signTransaction({
        to: `${process.env.RECIPIENT_1}`,
        value: ethers.utils.parseEther("1.0")
    });

    wallet.sendTransaction(signedTx);

    const result = await wallet.providers.waitForTransaction(signedTx);

    console.log(result);
    return result;
}

sendTransaction();

