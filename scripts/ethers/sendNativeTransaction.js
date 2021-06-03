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
  const sendEthersTx = {
    to: `${process.env.RECIPIENT_1}`,
    value: ethers.BigNumber.from(`${process.env.TRANSFER_VALUE}`),
    from: wallet.address,
    gasLimit: '0x5B8D80'
  };

  const transactionResponse = await wallet.sendTransaction(sendEthersTx);

  const result = await transactionResponse.wait();

  console.log(result);
  return result;
}

sendTransaction();

