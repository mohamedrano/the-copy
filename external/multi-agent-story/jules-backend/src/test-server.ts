import Fastify from "fastify";
import { config } from "./config";

const app = Fastify({
  logger: true,
});

// Health check
app.get("/health", async (request, reply) => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.environment,
    version: config.appVersion,
  };
});

const start = async () => {
  try {
    await app.listen({ port: config.port, host: config.host });
    console.log(`🚀 Server running on http://${config.host}:${config.port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
