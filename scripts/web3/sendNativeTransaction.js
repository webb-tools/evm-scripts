require("dotenv").config({ path: '../.env' });
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

let provider = new HDWalletProvider({
  providerOrUrl: `${process.env.ENDPOINT}`,
  privateKeys: [`${process.env.PRIVATE_KEY}`],
});

const web3 = new Web3(provider);

async function sendTransaction() {
  const accounts = await web3.eth.getAccounts();

  const sendWeb3Tx = {
    to: `${process.env.RECIPIENT_1}`,
    value: web3.utils.toBN(`${process.env.TRANSFER_VALUE}`),
    from: accounts[0]
  };

  const transactionResponse = await web3.eth.sendTransaction(sendWeb3Tx);

  console.log(transactionResponse);
  return transactionResponse;
}

sendTransaction();
provider.engine.stop();
