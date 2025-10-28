-- USALLI Bank Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'client',
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    routing_number VARCHAR(100) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    blocked_step INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit requests table
CREATE TABLE IF NOT EXISTS credit_requests (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Unlock codes table
CREATE TABLE IF NOT EXISTS unlock_codes (
    id VARCHAR(100) PRIMARY KEY,
    transfer_id VARCHAR(100) NOT NULL REFERENCES transfers(id),
    step_number INTEGER NOT NULL,
    code VARCHAR(50) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    sender VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users (passwords will be hashed by init-db.js)
INSERT INTO users (id, name, email, password, role, balance) VALUES
    (1, 'Jean Dupont', 'client@usalli.com', 'temp', 'client', 12500.75),
    (2, 'Admin USALLI', 'admin@usalli.com', 'temp', 'admin', 0),
    (3, 'Maria Garcia', 'maria@usalli.com', 'temp', 'client', 7800.20)
ON CONFLICT (email) DO NOTHING;

-- Insert default transfers
INSERT INTO transfers (id, user_id, amount, account_holder_name, account_number, routing_number, reason, status, blocked_step, created_at) VALUES
    ('trf_1', 1, 500, 'PG&E', '987654321', '121000358', 'Utility Bill #U2023-10-456', 'completed', 0, '2023-10-15T10:00:00Z'),
    ('trf_2', 1, 12000, 'SF Real Estate Co.', '123456789', '121000248', 'Down payment for condo', 'blocked', 1, '2023-10-20T14:30:00Z'),
    ('trf_3', 3, 250, 'Amazon Services LLC', '5551234567', '021000021', 'Online purchase', 'completed', 0, '2023-10-22T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert default credit requests
INSERT INTO credit_requests (id, user_id, amount, reason, status, created_at) VALUES
    ('cr_1', 1, 5000, 'Home renovation', 'approved', '2023-09-10T11:00:00Z'),
    ('cr_2', 3, 10000, 'New car down payment', 'pending', '2023-10-18T16:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insert default chat messages
INSERT INTO chat_messages (user_id, sender, text) VALUES
    (1, 'model', 'Welcome! How can I assist you today?'),
    (3, 'model', 'Welcome! How can I assist you today?')
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
    ('block_step_messages', '["For your security, this transfer has been temporarily paused. Please provide the first verification code to proceed.","Thank you. As an additional security measure, a second verification is required. Please provide the next code.","Almost there. We need one final verification to complete your transfer. Please provide the final code.","Final security step pending. The transaction will be processed after this verification."]')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transfers_user_id ON transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_requests_user_id ON credit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_unlock_codes_transfer_id ON unlock_codes(transfer_id);
