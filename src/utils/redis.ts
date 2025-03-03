import { createClient } from "redis";

const client = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

client.on("error", (err) => console.error("Redis Error:", err));
client.on("reconnecting", () => console.log("Reconnecting to Redis..."));

(async () => {
  try {
    await client.connect();
    console.log("Redis connection established!");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

// Graceful Shutdown
process.on("SIGINT", async () => {
  await client.disconnect();
  console.log("Redis client disconnected");
  process.exit(0);
});

export default client;
