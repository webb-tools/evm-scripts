require("dotenv").config({ path: '../.env' });

const ethers = require('ethers');
const nativeAnchorAbi = require('../../build/contracts/NativeAnchor.json');
const WebSocket = require('ws');
const MerkleTree = require('../../lib/MerkleTree');
const parseNote = require('../utils/parseNote');
const getLeavesFromRelayer = require('../utils/getLeavesFromRelayer');
const fs = require('fs');
const websnarkUtils = require('websnark/src/utils');
const buildGroth16 = require('websnark/src/groth16');
const snarkjs = require('snarkjs');
const getRelayerInformation = require("../utils/relayer/getRelayerInformation");
const bigInt = snarkjs.bigInt;
const toHex = (number, length = 32) => 
  '0x' + (number instanceof Buffer ? number.toString('hex') : bigInt(number).toString(16)).padStart(length * 2, '0');

// Accept as command-line input necessary values (contract address, note, recipient, network)
const contractAddress = process.argv[2];
const noteString = process.argv[3];
const recipientAddress = process.argv[4];
const networkName = process.argv[5];

const MERKLE_TREE_HEIGHT = 20;
let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

const anchorInstance = new ethers.Contract(contractAddress, nativeAnchorAbi.abi, provider);

// BigNumber for principle
const calculateFee = (withdrawFeePercentage, principle) => {
  const principleBig = snarkjs.bigInt(principle);
  const withdrawFeeMill = withdrawFeePercentage * 1000000;
  const withdrawFeeMillBig = snarkjs.bigInt(withdrawFeeMill);
  const feeBigMill = principleBig * withdrawFeeMillBig;
  const feeBig = feeBigMill / snarkjs.bigInt(1000000);
  const fee = feeBig.toString();

  return fee;
}

async function generateMerkleProof(deposit, leaves) {
  const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves);

  let leafIndex = leaves.findIndex((entry) => entry == deposit.commitment);

  const retVals = await tree.path(leafIndex);

  return retVals;
}

async function generateSnarkProof(leaves, deposit, recipient, relayer, fee) {
  // find the inputs that correspond to the path for the deposit
  const { root, path_elements, path_index } = await generateMerkleProof(deposit, leaves);

  let groth16 = await buildGroth16();
  let circuit = require('../../build/circuits/withdraw.json');
  let proving_key = fs.readFileSync('../build/circuits/withdraw_proving_key.bin').buffer;

  // Circuit input
  const input = {
    // public
    root: root,
    nullifierHash: deposit.nullifierHash,
    relayer: bigInt(relayer),
    recipient: bigInt(recipient),
    fee: bigInt(fee),
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

function handleMessage(data) {
  if (data.error || data.withdraw?.errored) {
    return 'error';
  } else if (data.network === 'invalidRelayerAddress') {
    return 'error';
  } else if (data.withdraw?.finlized) {
    return 'exit';
  } else {
    return 'continue';
  }
}

async function getWithdrawTxData(noteString, recipient) {
  const deposit = parseNote(noteString);
  const leaves = await getLeavesFromRelayer(contractAddress);
  const denomination = await anchorInstance.functions.denomination();
  const relayerInfo = await getRelayerInformation('http://nepoche.com:9955/api/v1/info', networkName);
  const fee = calculateFee(relayerInfo.withdrawFeePercentage, denomination);
  const {proof, args} = await generateSnarkProof(leaves, deposit, recipient, relayerInfo.account, fee);
  let withdrawTxData = {
    contract: contractAddress,
    proof,
    root: args[0],
    nullifierHash: args[1],
    recipient: args[2],
    relayer: args[3],
    fee: args[4],
    refund: args[5],
  };
  return withdrawTxData;
}

async function runScript() {
  const withdrawTxData = await getWithdrawTxData(noteString, recipientAddress);
  let relayerMessage = {
    evm: {
      [networkName]: {
        relayWithdraw: withdrawTxData
      }
    }
  };

  // open websocket to the relayer
  const client = new WebSocket('ws://nepoche.com:9955/ws');
  await new Promise((resolve) => client.on('open', resolve));
  console.log('Connected to Relayer!');

  // Setup listening to relayer response
  client.on('message', async (data) => {
    console.log('Received data from the relayer');
    console.log('<==', data);
    const msg = JSON.parse(data);
    const result = handleMessage(msg);
    if (result === 'error') {
      process.exit(1);
    } else if (result === 'continue') {
      // all good.
      return;
    } else if (result === 'exit') {
      console.log('Transaction Done and Relayed Successfully!');
      // check the recipient balance
      process.exit(0);
    }
  });
  
  // Send info to the relayer
  if (client.readyState === client.OPEN) {
    let data = JSON.stringify(relayerMessage);
    console.log('Sending Proof to the Relayer ..');
    console.log('=>', data);
    client.send(data, (err) => {
      console.log('Proof Sent!');
      if (err !== undefined) {
        console.log('!!Error!!', err);
        client.terminate();
        process.exit(1);
      }
    });
  }
}

runScript();
