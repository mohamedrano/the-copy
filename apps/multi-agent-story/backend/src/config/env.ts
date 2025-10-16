import { z } from 'zod';

const envSchema = z.object({
  // JWT Secret - Required and must be at least 32 characters
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Redis
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL'),
  
  // CORS Origins
  CORS_ORIGINS: z.string().optional().default('http://localhost:5181'),
  
  // Gemini AI API
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  
  // Server Configuration
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('8000'),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().min(1)).default('100'),
  RATE_LIMIT_TIME_WINDOW: z.string().default('15m'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      console.error('\n💡 Please check your .env file and ensure all required variables are set.');
      process.exit(1);
    }
    throw error;
  }
}
