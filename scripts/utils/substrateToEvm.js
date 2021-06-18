const { decodeAddress } = require('@polkadot/util-crypto');

const convertToEvmAddress = (substrateAddress) => {
  const addressBytes = decodeAddress(substrateAddress);
  return '0x' + Buffer.from(addressBytes.subarray(0, 20)).toString('hex');
}

console.log(convertToEvmAddress(process.argv[2]));