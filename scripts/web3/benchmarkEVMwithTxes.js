const { ApiPromise, WsProvider, ApiOptions } = require('@polkadot/api');
const spec = require('@edgeware/node-types').spec;

require("dotenv").config({ path: '../.env' });
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");

const options = {
  provider : new WsProvider('ws://beresheet3.edgewa.re:9944'),
  ...spec,
};

let provider = new HDWalletProvider({
  providerOrUrl: `${process.env.ENDPOINT}`,
  privateKeys: [`${process.env.PRIVATE_KEY}`],
});

const web3 = new Web3(provider);

async function sendTransaction() {
  const api = await ApiPromise.create(options);
  const accounts = await web3.eth.getAccounts();

  const nonce = await web3.eth.getTransactionCount(accounts[0]);
  const txes = [...Array(1000).keys()].map(k => {
    const sendWeb3Tx = {
      to: `${process.env.RECIPIENT_1}`,
      value: web3.utils.toBN(`${process.env.TRANSFER_VALUE}`),
      from: accounts[0],
      nonce: k + nonce
    };

    return sendWeb3Tx;
  });

  const txReceipts = await Promise.all(txes.map(async tx => {
    await web3.eth.sendTransaction(tx)
  }));
  console.log(txReceipts);

  const unsub = await api.rpc.chain.subscribeNewHeads((header) => {
    console.log("Block " + header.blockNumber + " Mined.");
  });
  console.timeEnd('Transactions sent to the node in');
  let i = 0;
  let j = 0;
  let oldPendingTx = 0;
  let interval = setInterval(async () => {
    await api.rpc.author.pendingExtrinsics((extrinsics) => {
      i++;
      j++;
      if (oldPendingTx > extrinsics.length) {
        console.log("Approx TPS: ", (oldPendingTx - extrinsics.length)/j);
        j = 0;
      }
      if(extrinsics.length === 0){
        console.log(i + " Second passed, No pending extrinsics in the pool.");
        clearInterval(interval);
        unsub();
        process.exit();
      }
      console.log(i + " Second passed, " + extrinsics.length + " pending extrinsics in the pool");
      oldPendingTx = extrinsics.length;
    });
  }, 1000);
}

sendTransaction();
provider.engine.stop();
