import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
     
    uptime: process.uptime()
  });
});

router.get('/ready', async (req: Request, res: Response) => {
  const checks: Record<string, boolean> = {};
  let isReady = true;

   
  checks.geminiApiKey = Boolean(process.env.GEMINI_API_KEY);
  if (!checks.geminiApiKey) {
    isReady = false;
  }

  try {
     
    const testFile = path.join(process.cwd(), '.health-check-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    checks.fileSystem = true;
  } catch {
    checks.fileSystem = false;
    isReady = false;
  }

  const status = isReady ? 200 : 503;
  res.status(status).json({
    status: isReady ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString()
  });
});

router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Cloud Run healthcheck endpoint
router.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('ok');
});

export default router;
