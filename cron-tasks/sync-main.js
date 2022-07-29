const axios = require("axios");
const token = process.env.BETTERLOX_API_TOKEN;

const instance = axios.create({
  baseURL: 'https://betterlox.herokuapp.com/api',
  headers: {'X-Betterlox-API-Token': token}
});

async function main() {
  try {
    const response = await instance.post('/admin/sync?limit=250');
    if (!response || !response.data) {
      throw new Error("Error occurred: no response or response.data");
    }
    if (!response.data.success) {
      throw new Error(response.data.message || "Error occurred: success false");
    }
    console.log("Successfully completed sync");
    if (response.data.synced) {
      const syncedSummary = response.data.synced.map((item) => `${item.id}:${item.title || item.name}`);
      console.log(JSON.stringify({ type: response.data.type || "unknown", synced: syncedSummary }));
    }
  } catch (error) {
    const message = error && error.message ? error.message : error;
    console.error("An error was caught", message);
  }
}

main();