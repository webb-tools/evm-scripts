require("dotenv").config({ path: '../.env' }); //.env path is dependent upon where the script is run.
const Web3 = require('web3');
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

let provider;

if (process.env.WEBSOCKETS) {
    provider = new Web3.providers.WebsocketProvider(`${process.env.ENDPOINT}`);
}
else {
    provider = new Web3.providers.HttpProvider(`${process.env.ENDPOINT}`);
}
const web3 = new Web3(provider);
const web3Account = web3.eth.accounts.privateKeyToAccount(`${process.env.PRIVATE_KEY}`);

async function deployNativeAnchor() {

    const hasherContract = new web3.eth.Contract(hasherContractRaw.abi);
    const hasherTx = hasherContract.deploy({
        data: hasherContractRaw.bytecode
    }).send({
        from: web3Account.address,
        gas: '6000000'
    });
    const hasherReceipt = await hasherTx;
    
    const verifierContract = new web3.eth.Contract(verifierContractRaw.abi);
    const verifierTx = verifierContract.deploy({
        data: verifierContractRaw.bytecode
    }).send({
        from: web3Account.address,
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
        from: web3Account.address,
        gas: '6000000'
    });

    const nativeAnchorReceipt = await nativeAnchorTx;
    console.log('NativeAnchor deployed at: ' + nativeAnchorReceipt._address);
    return;
}

deployNativeAnchor();
