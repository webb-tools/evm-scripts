require("dotenv").config({ path: '../.env' });
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const snarkjs = require('snarkjs');
const crypto = require('crypto');
const bigInt = snarkjs.bigInt
const createDeposit = require('../utils/createDeposit');
const nativeAnchorAbi = require('../../build/contracts/NativeAnchor.json');

const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes));
const toFixedHex = (number, length = 32) => 
  '0x' + (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0');

let provider = new HDWalletProvider({
  providerOrUrl: `${process.env.ENDPOINT}`,
  privateKeys: [`${process.env.PRIVATE_KEY}`],
});

const web3 = new Web3(provider);

const contractAddress = process.argv[2];

async function deposit() {
  const deposit = createDeposit(rbigint(31), rbigint(31));
  const chainId = await web3.eth.getChainId();
  const accounts = await web3.eth.getAccounts();

  const nativeAnchorContract = new web3.eth.Contract(nativeAnchorAbi.abi, contractAddress);
  
  // Value is taken from contract migration (mixer deposit denomination) and converted to base16
  const depositTx = nativeAnchorContract.methods
      .deposit(toFixedHex(deposit.commitment))
      .send({ 
        value: web3.utils.toBN('0x16345785D8A0000'),
        from: accounts[0],
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
provider.engine.stop();
