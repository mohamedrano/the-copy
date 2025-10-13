import { config } from '../src/config'

// Set test environment
process.env.NODE_ENV = 'test'
process.env.LOG_LEVEL = 'error'

// Mock environment variables for testing
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://jules_user:jules_password@localhost:5432/jules_test_db'
process.env.JWT_SECRET = 'test-jwt-secret-key-min-32-characters-long'
process.env.ENCRYPTION_KEY = 'test-encryption-key-44-chars-base64-encode='

console.log('Test environment setup completed')

