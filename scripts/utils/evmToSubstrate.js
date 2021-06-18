const { encodeAddress, blake2AsHex } = require('@polkadot/util-crypto');

const convertToSubstrateAddress = (evmAddress, prefix = 42) => {
  const addressBytes = Buffer.from(evmAddress.slice(2), 'hex');
  const prefixBytes = Buffer.from('evm:');
  const convertBytes = Uint8Array.from(Buffer.concat([ prefixBytes, addressBytes ]));
  const finalAddressHex = blake2AsHex(convertBytes, 256);
  return encodeAddress(finalAddressHex, prefix);
}

console.log(convertToSubstrateAddress(process.argv[2]));