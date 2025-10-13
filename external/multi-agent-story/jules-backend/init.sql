-- Initialize Jules Database
-- This file is executed when the PostgreSQL container starts

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE jules_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'jules_db')\gexec

-- Connect to the database
\c jules_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

