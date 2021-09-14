// This script can be run without arguments to generate all new contracts or,
// the script can be run as `node deployWEBBAnchor <hasherAddress> <verifierAddress>`
// to create a mixer with existing hasher and verifier contracts.

require("dotenv").config({ path: '../.env' });
const BigNumber = require('bignumber.js');
const ethers = require("ethers");
const verifierContract = require('../../build/contracts/VerifierPoseidonBridge.json');
const WEBBAnchorContract = require('../../build/contracts/WEBBAnchor2.json');
const WEBBContract = require('../../build/contracts/WEBB.json');
const GovernorBravoImmutableContract = require('../../build/contracts/GovernorBravoImmutable.json');
const TimelockHarnessContract = require('../../build/contracts/TimelockHarness.json');
const poseidonGenContract = require('circomlib/src/poseidon_gencontract.js');

const TimelockHarnessContractRaw = {
  contractName: 'TimelockHarness',
  abi: TimelockHarnessContract.abi,
  bytecode: TimelockHarnessContract.bytecode,
};

const GovernorBravoImmutableContractRaw = {
  contractName: 'GovernorBravoImmutable',
  abi: GovernorBravoImmutableContract.abi,
  bytecode: GovernorBravoImmutableContract.bytecode,
};

const WEBBTokenContractRaw = {
  contractName: 'WEBB',
  abi: WEBBContract.abi,
  bytecode: WEBBContract.bytecode,
};

const hasherContractRaw = {
  contractName: 'Hasher',
  abi: poseidonGenContract.abi,
  bytecode: poseidonGenContract.createCode(2),
};

const verifierContractRaw = {
  contractName: 'Verifier',
  abi: verifierContract.abi,
  bytecode: verifierContract.bytecode,
};

const WEBBAnchorContractRaw = {
  contractName: 'WEBBAnchor2',
  abi: WEBBAnchorContract.abi,
  bytecode: WEBBAnchorContract.bytecode,
};

let provider;

if (process.env.WEBSOCKETS) {
  provider = new ethers.providers.WebSocketProvider(`${process.env.ENDPOINT}`);
}
else {
  provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);
}

// Deployed hasher: 0xA785cCf40cca32567e3a1378B67B58eb207D37b1
// Deployed verifier: 0xBd5782a8D15DEbed35655181cA99e02809f07DDE
// Deployed WEBB: 0xE1995fc96859eED4a26c8ca325dD10fBF72E24C3

const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const delay = '345600';

let receipt;

async function deployWEBBAnchor() {
  // deploy WEBB gov token first and then add to anchor
  const WEBBFactory = new ethers.ContractFactory(WEBBTokenContractRaw.abi, WEBBTokenContractRaw.bytecode, wallet);
  const WEBB = await WEBBFactory.deploy("Webb Governance Token", "WEBB");
  await WEBB.deployed();
  console.log(`Deployed WEBB: ${WEBB.address}`);
  // deploy timelockHarness
  const TimelockHarnessFactory = new ethers.ContractFactory(TimelockHarnessContractRaw.abi, TimelockHarnessContractRaw.bytecode, wallet);
  const TimelockHarness = await TimelockHarnessFactory.deploy(wallet.address, delay);
  await TimelockHarness.deployed();
  console.log(`Deployed TimelockHarness: ${TimelockHarness.address}`);
  // deploy gov bravo
  const GovBravoFactory = new ethers.ContractFactory(GovernorBravoImmutableContractRaw.abi, GovernorBravoImmutableContractRaw.bytecode, wallet);
  const GovBravo = await GovBravoFactory.deploy(TimelockHarness.address, WEBB.address, wallet.address, '10', '1', '100000000000000000000000');
  await GovBravo.deployed();
  console.log(`Deployed GovBravo: ${GovBravo.address}`);

  const hasherFactory = new ethers.ContractFactory(hasherContractRaw.abi, hasherContractRaw.bytecode, wallet);
  let hasherInstance = await hasherFactory.deploy({gasLimit: '0x5B8D80'});
  await hasherInstance.deployed();
  console.log(`Deployed Hasher: ${hasherInstance.address}`);

  const verifierFactory = new ethers.ContractFactory(verifierContractRaw.abi, verifierContractRaw.bytecode, wallet);
  let verifierInstance = await verifierFactory.deploy({gasLimit: '0x5B8D80'});
  await verifierInstance.deployed();
  console.log(`Deployed Verifier: ${verifierInstance.address}`);

  const denomination = ethers.BigNumber.from("100000000000000000");
  const merkleTreeHeight = 20;
  // Rinkeby chain id is 4
  const CHAIN_ID = 4;
  const WEBBAnchorFactory = new ethers.ContractFactory(WEBBAnchorContractRaw.abi, WEBBAnchorContractRaw.bytecode, wallet);
  // set gov bravo to anchor admin on deployment
  let WEBBAnchorInstance = await WEBBAnchorFactory.deploy(
    verifierInstance.address,
    hasherInstance.address,
    denomination,
    merkleTreeHeight,
    CHAIN_ID,
    WEBB.address,
    wallet.address,
    GovBravo.address,
    wallet.address,
  {gasLimit: '0x5B8D80'});
  const WEBBAnchorAddress = await WEBBAnchorInstance.deployed();
  console.log(`Deployed WEBBAnchor: ${WEBBAnchorAddress.address}`);

  // transfer ownership of token/minting rights to the anchor
  MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE'));
  receipt = await WEBB.grantRole(MINTER_ROLE, WEBBAnchorAddress.address);
  console.log(receipt);  
  process.exit();
}

deployWEBBAnchor()