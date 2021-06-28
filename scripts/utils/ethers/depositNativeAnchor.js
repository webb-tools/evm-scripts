const ethers = require("ethers");
require("dotenv").config({ path: '../../../.env' });
const snarkjs = require('snarkjs');
const crypto = require('crypto');
const bigInt = snarkjs.bigInt
const createDeposit = require('../createDeposit');
const nativeAnchorAbi = require('../../../build/contracts/NativeAnchor.json');

const rbigint = (nbytes) => snarkjs.bigInt.leBuff2int(crypto.randomBytes(nbytes));
const toFixedHex = (number, length = 32) => 
  '0x' + (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0');

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function depositNativeAnchor(contractAddress) {
  const deposit = createDeposit(rbigint(31), rbigint(31));
  const chainId = await wallet.getChainId();

  // This contract address should be the same if first transactions made from account[0] on
  // `ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"`
  const nativeAnchorInstance = new ethers.Contract(contractAddress, nativeAnchorAbi.abi, wallet);
  const denomination = await nativeAnchorInstance.functions.denomination();
  await nativeAnchorInstance.deposit(toFixedHex(deposit.commitment), { value: denomination.toString() });

  // return the note of the deposit, contains secret info
  return `anchor-edg-100-${chainId}-${toFixedHex(deposit.preimage, 62)}`
}

module.exports = depositNativeAnchor;
