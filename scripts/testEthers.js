const deployNativeAnchor = require('./utils/deployNativeAnchor');
const depositNativeAnchor = require('./utils/depositNativeAnchor');
const getDepositEvents = require('./utils/getDepositEvents');

async function testEthers() {
    // Test EVM deployment of a contract
    const anchorAddress = await deployNativeAnchor();
    console.log("mixer deployed at: " + anchorAddress);
    
    // Test EVM transaction
    const noteString = await depositNativeAnchor(anchorAddress);
    console.log("deposit successful: " + noteString);

    // Test retrieving logs from the EVM
    const depositLogs = await getDepositEvents(anchorAddress);
    console.log(depositLogs);
}

testEthers();
