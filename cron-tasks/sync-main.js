const axios = require("axios");
const token = process.env.BETTERLOX_API_TOKEN;

const instance = axios.create({
  baseURL: 'https://betterlox.herokuapp.com/api',
  headers: {'X-Betterlox-API-Token': token}
});

console.log((new Date()).toISOString(), 'Kicking off the Betterlox Sync task');

const { SYNC_LIMIT = 300 } = process.env;

console.log(`Limit: ${SYNC_LIMIT}`);

function ts() {
  const d = new Date();
  return `[${d.toLocaleDateString()} ${d.toLocaleTimeString()}]`;
}

async function main() {
  try {
    const response = await instance.post(`/remote/execute-sync?limit=${SYNC_LIMIT}`);
    if (!response || !response.data) {
      throw new Error("Error occurred: no response or response.data");
    }
    if (!response.data.success) {
      throw new Error(response.data.message || "Error occurred: success false");
    }
    console.log(`${ts()} Successfully completed sync (${response.data.synced.length} ${response.data.type})`);
  } catch (error) {
    const now = new Date();
    const message = error && error.message ? error.message : error;
    console.error(`${ts()} An error was caught: ${message}`);
  }
}

main();