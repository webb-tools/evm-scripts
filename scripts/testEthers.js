require("dotenv").config({ path: '../.env' });
const deployNativeAnchor = require('./utils/ethers/deployNativeAnchor');
const depositNativeAnchor = require('./utils/ethers/depositNativeAnchor');
const getDepositEvents = require('./utils/ethers/getDepositEvents');

async function testEthers() {
  // Test EVM deployment of a contract
  const anchorAddress = await deployNativeAnchor();
  console.log("mixer deployed at: " + anchorAddress);
  
  // Test EVM transaction on existing contract
  const noteString = await depositNativeAnchor(anchorAddress);
  console.log("deposit successful: " + noteString);

  // Test retrieving logs from the EVM
  const depositLogs = await getDepositEvents(anchorAddress);
  console.log(depositLogs);
}

testEthers();
