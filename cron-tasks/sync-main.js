const axios = require("axios");
const token = process.env.BETTERLOX_API_TOKEN;

const instance = axios.create({
  baseURL: 'https://betterlox.herokuapp.com/api',
  headers: {'X-Betterlox-API-Token': token}
});

console.log((new Date()).toISOString(), 'Kicking off the Betterlox Sync task');

const { SYNC_LIMIT = 1000 } = process.env;

console.log(`Limit: ${SYNC_LIMIT}`);

async function main() {
  try {
    const response = await instance.post(`/admin/sync?limit=${SYNC_LIMIT}`);
    const now = new Date();
    if (!response || !response.data) {
      throw new Error("Error occurred: no response or response.data");
    }
    if (!response.data.success) {
      throw new Error(response.data.message || "Error occurred: success false");
    }
    console.log(`[${now.toLocaleDateString()} ${now.toLocaleTimeString()}] Successfully completed sync (${response.data.synced.length} ${response.data.type})`);
  } catch (error) {
    const now = new Date();
    const message = error && error.message ? error.message : error;
    console.error(`[${now.toLocaleDateString()}] An error was caught: ${message}`);
  }
}

main();