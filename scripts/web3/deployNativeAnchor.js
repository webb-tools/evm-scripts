require("dotenv").config({ path: '../.env' }); //.env path is dependent upon where the script is run.
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const genContract = require('circomlib/src/mimcsponge_gencontract.js');
const verifierContract = require('../../build/contracts/Verifier.json');
const nativeAnchorContract = require('../../build/contracts/NativeAnchor.json');

const hasherContractRaw = {
  contractName: 'Hasher',
  abi: genContract.abi,
  bytecode: genContract.createCode('mimcsponge', 220),
};

const verifierContractRaw = {
  contractName: 'Verifier',
  abi: verifierContract.abi,
  bytecode: verifierContract.bytecode,
};

const nativeAnchorContractRaw = {
  contractName: 'NativeAnchor',
  abi: nativeAnchorContract.abi,
  bytecode: nativeAnchorContract.bytecode,
};

let provider = new HDWalletProvider({
  providerOrUrl: `${process.env.ENDPOINT}`,
  privateKeys: [`${process.env.PRIVATE_KEY}`],
});

const web3 = new Web3(provider);

async function deployNativeAnchor() {
  const accounts = await web3.eth.getAccounts();
  const hasherContract = new web3.eth.Contract(hasherContractRaw.abi);
  const hasherTx = hasherContract.deploy({
    data: hasherContractRaw.bytecode
  }).send({
    from: accounts[0],
    gas: '6000000'
  });
  const hasherReceipt = await hasherTx;
  
  const verifierContract = new web3.eth.Contract(verifierContractRaw.abi);
  const verifierTx = verifierContract.deploy({
    data: verifierContractRaw.bytecode
  }).send({
    from: accounts[0],
    gas: '6000000'
  });
  const verifierReceipt = await verifierTx;
  
  const denomination = web3.utils.toBN("100000000000000000");
  const merkleTreeHeight = 20;
  const nativeAnchorContract = new web3.eth.Contract(nativeAnchorContractRaw.abi);
  const nativeAnchorTx = nativeAnchorContract.deploy({
    data: nativeAnchorContractRaw.bytecode,
    arguments: [verifierReceipt._address, hasherReceipt._address, denomination, merkleTreeHeight]
  }).send({
    from: accounts[0],
    gas: '6000000'
  });

  const nativeAnchorReceipt = await nativeAnchorTx;
  console.log('NativeAnchor deployed at: ' + nativeAnchorReceipt._address);
  return;
}

deployNativeAnchor();
provider.engine.stop();
