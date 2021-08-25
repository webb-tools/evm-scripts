const Ethers = require('ethers');

const toHex = (covertThis, padding) => {
  return Ethers.utils.hexZeroPad(Ethers.utils.hexlify(covertThis), padding);
};

const createResourceID = (contractAddress, chainID) => {
  return toHex(contractAddress + toHex(chainID, 1).substr(2), 32)
};

module.exports = createResourceID;
