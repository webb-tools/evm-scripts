const fetch = require('node-fetch');

async function getLeavesFromServer(contractAddress) {
  const serverResponse = await fetch(
    `http://nepoche.com:5050/evm-leaves/${contractAddress}`
  );
  const jsonResponse = await serverResponse.json();
  let leaves = jsonResponse.leaves.map((val) => val.commitment);
  return leaves;
};

module.exports = getLeavesFromServer;