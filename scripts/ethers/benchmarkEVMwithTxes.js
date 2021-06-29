const ethers = require("ethers");
const { ApiPromise, WsProvider, ApiOptions } = require('@polkadot/api');
const spec = require('@edgeware/node-types').spec;

const options = {
  provider : new WsProvider('ws://beresheet3.edgewa.re:9944'),
  ...spec,
};

require("dotenv").config({ path: '../.env' });

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function benchmark() {
  const api = await ApiPromise.create(options);
  const sendEthersTx = {
    to: `${process.env.RECIPIENT_1}`,
    value: ethers.BigNumber.from(`${process.env.TRANSFER_VALUE}`),
    from: wallet.address,
    gasLimit: '0x5B8D80'
  };

  console.time('Transactions sent to the node in');
  for (var k = 0; k < 100; k++) {
    const transactionResponses = await Promise.all([
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
      await wallet.sendTransaction(sendEthersTx),
    ]);
    console.log(transactionResponses);
    // await transactionResponse.wait();
  }

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

benchmark();

