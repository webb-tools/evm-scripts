const circomlib = require('circomlib')
const maci = require('maci-crypto');
const { hashLeftRight } = maci;

class PoseidonHasher {
  hash(level, left, right) {
    return hashLeftRight(BigInt(left), BigInt(right)).toString()
  }

  hash3(inputs) {
    if (inputs.length !== 3) throw new Error('panic');
    return circomlib.poseidon(inputs);
  }
}
const poseidonHasher = new PoseidonHasher();

const rbigint = (nbytes) => leBuff2int(crypto.randomBytes(nbytes))

function generateWebbDeposit(targetChainID = 0, secret = 31) {
  let deposit = {
    chainID: BigInt(targetChainID),
    secret: rbigint(secret),
    nullifier: rbigint(31)
  }

  deposit.commitment = poseidonHasher.hash3([deposit.chainID, deposit.nullifier, deposit.secret]);
  deposit.nullifierHash = poseidonHasher.hash(null, deposit.nullifier, deposit.nullifier);
  return deposit
}

module.exports = generateWebbDeposit;
