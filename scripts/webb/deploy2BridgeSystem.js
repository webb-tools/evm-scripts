// This script can be run without arguments to generate all new contracts or,
// the script can be run as `node deployWEBBAnchor <hasherAddress> <verifierAddress>`
//    to create a mixer with existing hasher and verifier contracts.

require("dotenv").config({ path: '../.env' });
const BigNumber = require('bignumber.js');
const ethers = require("ethers");
const verifierContract = require('../../build/contracts/VerifierPoseidonBridge.json');
const WEBBAnchorContract = require('../../build/contracts/WEBBAnchor2.json');
const WEBBContract = require('../../build/contracts/WEBB.json');
const GovernorBravoImmutableContract = require('../../build/contracts/GovernorBravoImmutable.json');
const TimelockHarnessContract = require('../../build/contracts/TimelockHarness.json');
const poseidonGenContract = require('circomlib/src/poseidon_gencontract.js');
const BridgeFactoryContract = require('../../build/contracts/BridgeFactory.json');
const BridgeContract = require('../../build/contracts/Bridge.json');
const AnchorHandlerContract = require('../../build/contracts/AnchorHandler.json');

async function deployTimelockHarness(wallet) {
  const delay = '345600';

  const TimelockHarnessContractRaw = {
    contractName: 'TimelockHarness',
    abi: TimelockHarnessContract.abi,
    bytecode: TimelockHarnessContract.bytecode,
  };

  // deploy timelockHarness
  const TimelockHarnessFactory = new ethers.ContractFactory(TimelockHarnessContractRaw.abi, TimelockHarnessContractRaw.bytecode, wallet);
  const TimelockHarness = await TimelockHarnessFactory.deploy(wallet.address, delay);
  await TimelockHarness.deployed();
  console.log(`Deployed TimelockHarness: ${TimelockHarness.address}`);

  return TimelockHarness;
}

async function deployGovBravoImmuable(wallet, webb, timelock) {
  const GovernorBravoImmutableContractRaw = {
    contractName: 'GovernorBravoImmutable',
    abi: GovernorBravoImmutableContract.abi,
    bytecode: GovernorBravoImmutableContract.bytecode,
  };

  // deploy gov bravo
  const GovBravoFactory = new ethers.ContractFactory(GovernorBravoImmutableContractRaw.abi, GovernorBravoImmutableContractRaw.bytecode, wallet);
  const GovBravo = await GovBravoFactory.deploy(timelock.address, webb.address, wallet.address, '10', '1', '100000000000000000000000');
  await GovBravo.deployed();
  console.log(`Deployed GovBravo: ${GovBravo.address}`);

  return GovBravo;
};

async function deployWEBBToken(wallet) {
  const WEBBTokenContractRaw = {
    contractName: 'WEBB',
    abi: WEBBContract.abi,
    bytecode: WEBBContract.bytecode,
  };

  // deploy WEBB gov token first and then add to anchor
  const WEBBFactory = new ethers.ContractFactory(WEBBTokenContractRaw.abi, WEBBTokenContractRaw.bytecode, wallet);
  const WEBB = await WEBBFactory.deploy("Webb Governance Token", "WEBB");
  await WEBB.deployed();
  console.log(`Deployed WEBB: ${WEBB.address}`);

  return WEBB;
}

async function deployHasher(wallet) {
  const hasherContractRaw = {
    contractName: 'Hasher',
    abi: poseidonGenContract.abi,
    bytecode: poseidonGenContract.createCode(2),
  };

  const hasherFactory = new ethers.ContractFactory(hasherContractRaw.abi, hasherContractRaw.bytecode, wallet);
  let hasherInstance = await hasherFactory.deploy({gasLimit: '0x5B8D80'});
  await hasherInstance.deployed();
  console.log(`Deployed Hasher: ${hasherInstance.address}`);

  return hasherInstance;
};

async function deployVerifier2(wallet) {
  const verifierContractRaw = {
    contractName: 'Verifier',
    abi: verifierContract.abi,
    bytecode: verifierContract.bytecode,
  };

  const verifierFactory = new ethers.ContractFactory(verifierContractRaw.abi, verifierContractRaw.bytecode, wallet);
  let verifierInstance = await verifierFactory.deploy({gasLimit: '0x5B8D80'});
  await verifierInstance.deployed();
  console.log(`Deployed Verifier: ${verifierInstance.address}`);

  return verifierInstance;
};

async function deployWEBBAnchor(wallet, chainId, webb, verifier, hasher, denomination, mtHeight, bridge, admin, handler) {
  const WEBBAnchorContractRaw = {
    contractName: 'WEBBAnchor2',
    abi: WEBBAnchorContract.abi,
    bytecode: WEBBAnchorContract.bytecode,
  };

  const WEBBAnchorFactory = new ethers.ContractFactory(WEBBAnchorContractRaw.abi, WEBBAnchorContractRaw.bytecode, wallet);
  let WEBBAnchorInstance = await WEBBAnchorFactory.deploy(
    verifier.address,
    hasher.address,
    denomination,
    mtHeight,
    chainId,
    webb.address,
    bridge,
    admin,
    handler,
  {gasLimit: '0x5B8D80'});
  await WEBBAnchorInstance.deployed();
  console.log(`Deployed WEBBAnchor: ${WEBBAnchorInstance.address}`);

  return WEBBAnchorInstance;
}


async function deployBridgeFactory(wallet) {
  const BridgeFactoryRaw = {
    contractName: 'BridgeFactory',
    abi: BridgeFactoryContract.abi,
    bytecode: BridgeFactoryContract.bytecode,
  };

  const BridgeFactoryFactory = new ethers.ContractFactory(BridgeFactoryRaw.abi, BridgeFactoryRaw.bytecode, wallet);
  let BridgeFactoryInstance = await BridgeFactoryFactory.deploy({gasLimit: '0x5B8D80'});
  await BridgeFactoryInstance.deployed();
  console.log(`Deployed BridgeFactory: ${BridgeFactoryInstance.address}`);

  return BridgeFactoryInstance;
};

async function deployBridge(wallet, chainId, relayers, thresh, fee, expiry) {
  const BridgeRaw = {
    contractName: 'Bridge',
    abi: BridgeContract.abi,
    bytecode: BridgeContract.bytecode,
  };

  const BridgeFactory = new ethers.ContractFactory(BridgeRaw.abi, BridgeRaw.bytecode, wallet);
  let BridgeInstance = await BridgeFactory.deploy(chainId, relayers, thresh, fee, expiry);
  await BridgeInstance.deployed();
  console.log(`Deployed Bridge: ${BridgeInstance.address}`);

  return BridgeInstance;
};

async function deployAnchorHandler(wallet, bridge, resourceIds, addresses) {
  const AnchorHandlerRaw = {
    contractName: 'AnchorHandler',
    abi: AnchorHandlerContract.abi,
    bytecode: AnchorHandlerContract.bytecode,
  };

  const AnchorHandlerFactory = new ethers.ContractFactory(AnchorHandlerRaw.abi, AnchorHandlerRaw.bytecode, wallet);
  let AnchorHandlerInstance = await AnchorHandlerFactory.deploy(bridge.address, resourceIds, addresses);
  await AnchorHandlerInstance.deployed();
  console.log(`Deployed AnchorHandler: ${AnchorHandlerInstance.address}`);

  return AnchorHandlerInstance;
};

let originChainProvider;
let destChainProvider;

if (process.env.WEBSOCKETS) {
  originChainProvider = new ethers.providers.WebSocketProvider(`${process.env.CHAIN1_ENDPOINT}`);
  destChainProvider = new ethers.providers.WebSocketProvider(`${process.env.CHAIN2_ENDPOINT}`);
}
else {
  originChainProvider = new ethers.providers.JsonRpcProvider(`${process.env.CHAIN1_ENDPOINT}`);
  destChainProvider = new ethers.providers.JsonRpcProvider(`${process.env.CHAIN2_ENDPOINT}`);
}

// Deployed hasher: 0xA785cCf40cca32567e3a1378B67B58eb207D37b1
// Deployed verifier: 0xBd5782a8D15DEbed35655181cA99e02809f07DDE
// Deployed WEBB: 0xE1995fc96859eED4a26c8ca325dD10fBF72E24C3

const privateKey = process.env.PRIVATE_KEY;
const originWallet = new ethers.Wallet(privateKey, originChainProvider);
const destWallet = new ethers.Wallet(privateKey, destChainProvider);
// const wallet = new ethers.Wallet('cff021ef34e504c19512bc3577c2bb3052574c1a5d1ad3a8b2943629d6edf762', provider);

let resourceID;

const toHex = (covertThis, padding) => {
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(covertThis), padding);
};

const createResourceID = (contractAddress, chainID) => {
  return toHex(contractAddress + toHex(chainID, 1).substr(2), 32)
};

async function deployOneSide(wallet, debugPrefix) {
  console.log(debugPrefix);
  console.log(await wallet.provider.getNetwork());
  const denomination = ethers.BigNumber.from("100000000000000000");
  const merkleTreeHeight = 20;
  // Rinkeby chain id is 4
  // Ganache is 1337
  const CHAIN_ID = (await wallet.provider.getNetwork()).chainId;
  const initialRelayer = wallet.address;
  const initRelayerThreshold = 1;
  const fee = 0;
  // Proposals live for 30 blocks
  const expiry = 30;

  const webb = await deployWEBBToken(wallet);
  let totalSupply = await webb.totalSupply();
  console.log(`Total supply: ${totalSupply.toString()}`);
  const tx = await webb.mint(wallet.address, '1000000000000000000000');
  await tx.wait();
  totalSupply = await webb.totalSupply();
  console.log(`Total supply: ${totalSupply.toString()}`);

  const timelock = await deployTimelockHarness(wallet);
  const gov = await deployGovBravoImmuable(wallet, webb, timelock);
  await timelock.harnessSetAdmin(gov.address);

  const hasher = await deployHasher(wallet);
  const verifier = await deployVerifier2(wallet);
  const anchor = await deployWEBBAnchor(
    wallet,
    CHAIN_ID,
    webb,
    verifier,
    hasher,
    denomination,
    merkleTreeHeight,
    wallet.address,
    wallet.address,
    wallet.address,
  );
  const bridge = await deployBridge(
    wallet,
    CHAIN_ID,
    [initialRelayer],
    initRelayerThreshold,
    fee,
    expiry,
  );
  // create resource ID using anchor address
  if (!resourceID) {
    resourceID = createResourceID(anchor.address, CHAIN_ID);
  }
  const initialResourceIDs = [resourceID];
  const initialContractAddresses = [anchor.address];

  const handler = await deployAnchorHandler(wallet, bridge, initialResourceIDs, initialContractAddresses);
  // transfer ownership of token/minting rights to the anchor
  MINTER_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('MINTER_ROLE'));
  receipt = await webb.grantRole(MINTER_ROLE, anchor.address);
  
  await bridge.adminSetResource(handler.address, resourceID, anchor.address);
  await anchor.setHandler(handler.address);
  await anchor.setBridge(bridge.address);
}

async function deployBothSides() {
  await deployOneSide(originWallet, 'ORIGIN      | ');
  await deployOneSide(destWallet, 'DESTINATION | ');
}

deployBothSides()