const fetch = require('node-fetch');

async function getLeavesFromRelayer(contractAddress) {
  const serverResponse = await fetch(
    `http://nepoche.com:9955/api/v1/leaves/${contractAddress}`
  );
  const jsonResponse = await serverResponse.json();
  let leaves = jsonResponse.leaves;
  return leaves;
};

module.exports = getLeavesFromRelayer;