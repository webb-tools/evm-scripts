# evm-scripts
A Repository full of simple scripts to test whichever locally running EVM you'd like

The scripts are defaulted to run on `ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"`

## Setup

1. Modify the .env file with the parameters you desire. 
2. Change into the `scripts` directory, all scripts should be run from here.
3. Run the scripts with `node <script> args[]`

## Verify EVM and RPC operating properly on the node

1. node testEthers.js

## Supported Scripts

Get the balance of an address:
    - `node ethers/viewBalance.js <address>`

Get the block at a specified number:
    - `node ethers/viewBlock.js <number>`

Deploy a contract:
    - `node ethers/deployNativeAnchor.js`

Send a signed transaction to a contract:
    - `node ethers/depositNativeAnchor.js <address>`

Read contract state from a function:
    - `node ethers/viewMerkleRootNativeAnchor.js <address>`

Retrieve all instances of an event from the blockchain for a contract:
    - `node ethers/viewDepositEvents.js <address>`

