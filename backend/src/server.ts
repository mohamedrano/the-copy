import express from 'express';
import { env } from '@/config/env';
import { setupMiddleware } from '@/middleware';
import { AnalysisController } from '@/controllers/analysis.controller';
import { logger } from '@/utils/logger';

const app = express();
const analysisController = new AnalysisController();

// Setup middleware
setupMiddleware(app);

// Health check endpoint
app.get('/api/health', analysisController.getHealth.bind(analysisController));

// Analysis endpoints
app.post('/api/analysis/pipeline', analysisController.runPipeline.bind(analysisController));
app.post('/api/analysis/review-screenplay', analysisController.reviewScreenplay.bind(analysisController));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'المسار غير موجود',
  });
});

// Start server
const server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`, {
    environment: env.NODE_ENV,
    port: env.PORT,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;