require("dotenv").config({ path: '../.env' });
const Web3 = require('web3');
const snarkjs = require('snarkjs');
const crypto = require('crypto');
const bigInt = snarkjs.bigInt
const createDeposit = require('../utils/createDeposit');
const nativeAnchorAbi = require('../../build/contracts/NativeAnchor.json');

const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes));
const toFixedHex = (number, length = 32) => 
    '0x' + (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0');

let provider;

if (process.env.WEBSOCKETS) {
    provider = new Web3.providers.WebsocketProvider(`${process.env.ENDPOINT}`);
}
else {
    provider = new Web3.providers.HttpProvider(`${process.env.ENDPOINT}`);
}
const web3 = new Web3(provider);
const web3Account = web3.eth.accounts.privateKeyToAccount(`${process.env.PRIVATE_KEY}`);

const contractAddress = process.argv[2];

async function deposit() {
    const deposit = createDeposit(rbigint(31), rbigint(31));
    const chainId = await web3.eth.getChainId();

    const nativeAnchorContract = new web3.eth.Contract(nativeAnchorAbi.abi, contractAddress);
    
    // Value is taken from contract migration (mixer deposit denomination) and converted to base16
    const depositTx = nativeAnchorContract.methods
        .deposit(toFixedHex(deposit.commitment))
        .send({ 
            value: web3.utils.toBN('0x16345785D8A0000'),
            from: web3Account.address,
            gas: 6000000,
        });
    const depositReceipt = await depositTx;

    // return the note of the deposit, contains secret info
    return `anchor-eth-.1-${chainId}-${toFixedHex(deposit.preimage, 62)}`
}

async function run() {
    const note = await deposit();
    console.log(note);
    return note;
}

run();
