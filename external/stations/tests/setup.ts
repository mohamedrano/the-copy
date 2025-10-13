import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { createServer } from 'http';
import express from 'express';
import { environment } from '../server/config/environment';

// Mock للبيئة في الاختبارات
process.env.NODE_ENV = 'test';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.VALID_API_KEYS = 'test-api-key-1,test-api-key-2';
process.env.SESSION_SECRET = 'test-session-secret-minimum-32-characters-long';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5000';

let testServer: any;
let testApp: express.Application;

beforeAll(async () => {
  // إعداد خادم الاختبار
  testApp = express();
  testServer = createServer(testApp);
  
  // إعدادات أساسية للاختبار
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: true }));
  
  // تسجيل بدء الاختبارات
  console.log('Test environment initialized');
});

afterAll(async () => {
  // تنظيف بعد انتهاء جميع الاختبارات
  if (testServer) {
    testServer.close();
  }
  
  console.log('Test environment cleaned up');
});

beforeEach(() => {
  // إعداد قبل كل اختبار
  console.log('Setting up test case');
});

afterEach(() => {
  // تنظيف بعد كل اختبار
  console.log('Cleaning up test case');
});

export { testApp, testServer };

