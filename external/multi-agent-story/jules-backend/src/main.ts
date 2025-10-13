import { app, prisma } from "./app";
import { config } from "./config";
import { logger } from "./utils/logger";
import cors from "@fastify/cors";
import { setupRateLimit } from "./api/middlewares/rate-limit.middleware";
import { setupErrorHandler } from "./api/middlewares/error.middleware";
import { registerRoutes } from "./api/routes/index";
import { SessionService } from "./services/session.service";
import { ApiKeyService } from "./services/api-key.service";
import { AgentService } from "./services/agent.service";
import { IdeaService } from "./services/idea.service";
import { ReviewService } from "./services/review.service";
import { TournamentService } from "./services/tournament.service";
import { DecisionService } from "./services/decision.service";
import { GeminiPool } from "./integrations/gemini/pool";
import client from "prom-client";

// Initialize default metrics
client.collectDefaultMetrics({ prefix: "jules_" });

// Create custom metrics
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

async function start() {
  try {
    // Register CORS
    await app.register(cors, {
      origin: config.corsOrigins,
      credentials: true,
    });

    // Register rate limiting
    await setupRateLimit(app);

    // Register error handler
    setupErrorHandler(app);

    // Test database connection
    await prisma.$connect();
    logger.info("✅ Database connected successfully");

    // Initialize services
    const geminiPool = new GeminiPool({
      model: "gemini-2.0-flash-exp",
      temperature: 0.7,
      maxTokens: 40000,
      topP: 0.8,
      topK: 40,
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 30000,
    });

    const apiKeyService = new ApiKeyService(prisma);
    const agentService = new AgentService(prisma, geminiPool);
    const ideaService = new IdeaService(prisma, agentService);
    const reviewService = new ReviewService(prisma, agentService);
    const tournamentService = new TournamentService(prisma, agentService);
    const decisionService = new DecisionService(prisma, agentService);

    // Register API routes
    await registerRoutes(app, {
      apiKeyService,
      agentService,
      ideaService,
      reviewService,
      tournamentService,
      decisionService,
    });

    logger.info("✅ API routes registered successfully");

    // Register metrics endpoint
    app.get("/metrics", async (req, res) => {
      res.header("Content-Type", client.register.contentType);
      return client.register.metrics();
    });

    logger.info("✅ Metrics endpoint registered successfully");

    // Register metrics middleware
    app.addHook("onRequest", async (request, reply) => {
      (request as any).startTime = Date.now();
    });

    app.addHook("onResponse", async (request, reply) => {
      const duration = ((Date.now() - (request as any).startTime) / 1000);
      const route = request.routeOptions.url || "unknown";
      
      httpRequestDuration.observe({
        method: request.method,
        route: route,
        status_code: reply.statusCode,
      }, duration);
      
      httpRequestTotal.inc({
        method: request.method,
        route: route,
        status_code: reply.statusCode,
      });
    });

    // Start server
    await app.listen({
      port: config.port,
      host: config.host,
    });

    logger.info(`🚀 Jules Server started successfully!`);
    logger.info(`📡 Server running on http://${config.host}:${config.port}`);
    logger.info(`📊 Environment: ${config.environment}`);
    logger.info(`🔧 Version: ${config.appVersion}`);
    logger.info(`🗄️  Database: Connected`);
  } catch (error) {
    logger.error("Failed to start server", { error });
    await prisma.$disconnect();
    process.exit(1);
  }
}

start();
