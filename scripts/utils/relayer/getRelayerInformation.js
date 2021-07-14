require("dotenv").config({ path: '../.env' });
const fetch = require("node-fetch");

async function getRelayerInformation(relayerEndpoint, chainName) {
  const relayerInfoRes = await fetch(relayerEndpoint);
  const relayerInfo = await relayerInfoRes.json();

  return {
    account: relayerInfo.evm[chainName].account,
    withdrewFeePercentage: relayerInfo.evm[chainName].withdrewFeePercentage,
    withdrewGaslimit: relayerInfo.evm[chainName].withdrewGaslimit,
  };
}

module.exports = getRelayerInformation;
