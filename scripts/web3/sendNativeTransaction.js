require("dotenv").config({ path: '../.env' });
const Web3 = require('web3');

let provider;

if (process.env.WEBSOCKETS) {
    provider = new Web3.providers.WebsocketProvider(`${process.env.ENDPOINT}`);
}
else {
    provider = new Web3.providers.HttpProvider(`${process.env.ENDPOINT}`);
}

const web3 = new Web3(provider);

async function sendTransaction() {

    const web3Account = web3.eth.accounts.privateKeyToAccount(`${process.env.PRIVATE_KEY}`);

    const sendWeb3Tx = {
        to: `${process.env.RECIPIENT_1}`,
        value: web3.utils.toBN(`${process.env.TRANSFER_VALUE}`),
        from: web3Account.address
    };

    console.log(web3Account);

    const transactionResponse = await web3.eth.sendTransaction(sendWeb3Tx);

    console.log(transactionResponse);
    return transactionResponse;
}

sendTransaction();

