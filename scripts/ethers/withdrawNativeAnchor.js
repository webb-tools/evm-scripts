require("dotenv").config({ path: '../.env' });

const MerkleTree = require('../../lib/MerkleTree');
const getDepositEvents = require('../utils/ethers/getDepositEvents');
const parseNote = require('../utils/parseNote');
const fs = require('fs');

const ethers = require("ethers");
const websnarkUtils = require('websnark/src/utils')
const buildGroth16 = require('websnark/src/groth16')
const snarkjs = require('snarkjs');
const bigInt = snarkjs.bigInt;
const toHex = (number, length = 32) => 
  '0x' + (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0');

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

// Accept as command-line input necessary values (contract address, note, recipient)
const contractAddress = process.argv[2];
const noteString = process.argv[3];
const recipientAddress = process.argv[4];

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const anchorAbi = require("../../build/contracts/Anchor.json");
const anchorInstance = new ethers.Contract(contractAddress, anchorAbi.abi, wallet);
const MERKLE_TREE_HEIGHT = 20;

async function generateMerkleProof(deposit) {
  const events = await getDepositEvents(contractAddress);

  const leaves = events
    .sort((a, b) => a.args.leafIndex - b.args.leafIndex) // Sort events in chronological order
    .map(e => e.args.commitment);
  const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves);

  let depositEvent = events.find(e => e.args.commitment === toHex(deposit.commitment));
  let leafIndex = depositEvent ? depositEvent.args.leafIndex : -1

  const retVals = await tree.path(leafIndex);

  return retVals;
}

async function generateSnarkProof(deposit, recipient) {
  // find the inputs that correspond to the path for the deposit
  const { root, path_elements, path_index } = await generateMerkleProof(deposit);

  let groth16 = await buildGroth16();
  let circuit = require('../../build/circuits/withdraw.json');
  let proving_key = fs.readFileSync('../build/circuits/withdraw_proving_key.bin').buffer;

  // Circuit input
  const input = {
    // public
    root: root,
    nullifierHash: deposit.nullifierHash,
    relayer: 0,
    recipient: bigInt(recipient),
    fee: 0,
    refund: 0,

    // private
    nullifier: deposit.nullifier,
    secret: deposit.secret,
    pathElements: path_elements,
    pathIndices: path_index,
  }
  
  const proofData = await websnarkUtils.genWitnessAndProve(groth16, input, circuit, proving_key)
  const { proof } = websnarkUtils.toSolidityInput(proofData)

  const args = [
    toHex(input.root),
    toHex(input.nullifierHash),
    toHex(input.recipient, 20),
    toHex(input.relayer, 20),
    toHex(input.fee),
    toHex(input.refund),
  ]

  return { proof, args };
}

async function withdraw(noteString, recipient) {
  const deposit = parseNote(noteString);
  const {proof, args} = await generateSnarkProof(deposit, recipient);
  const logs = await anchorInstance.withdraw(proof, ...args, { from: (await wallet.getAddress()), gasLimit: '0x5B8D80' });
  return logs;
}

async function runScript() {
  return await withdraw(noteString, recipientAddress);
}

runScript();
