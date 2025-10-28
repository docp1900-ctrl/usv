import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const UserRole = {
  CLIENT: 'client',
  ADMIN: 'admin',
};

const SALT_ROUNDS = 10;

function createPool() {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    
    return new Pool({
        connectionString: dbUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });
}

const pool = createPool();

// --- DATABASE ACCESS FUNCTIONS ---

// Auth
export const validateUser = async (email, password) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
    );
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    
    if (!user.password) {
        return null;
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
        return user;
    }
    
    return null;
};

// Users
export const getUsers = async () => {
    const result = await pool.query('SELECT id, name, email, role, balance, created_at FROM users');
    return result.rows;
};

export const getUserById = async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

export const createUser = async (name, email, password) => {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const result = await pool.query(
        'INSERT INTO users (name, email, password, role, balance) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, email, hashedPassword, UserRole.CLIENT, 0]
    );
    
    const newUser = result.rows[0];
    
    await pool.query(
        'INSERT INTO chat_messages (user_id, sender, text) VALUES ($1, $2, $3)',
        [newUser.id, 'model', 'Welcome! How can I assist you today?']
    );
    
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

// Transfers
export const getTransfers = async () => {
    const result = await pool.query('SELECT * FROM transfers ORDER BY created_at DESC');
    return result.rows;
};

export const getTransfersByUserId = async (userId) => {
    const result = await pool.query(
        'SELECT * FROM transfers WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows;
};

export const createTransfer = async (transferData) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const userResult = await client.query('SELECT * FROM users WHERE id = $1', [transferData.userId]);
        if (userResult.rows.length === 0) {
            throw new Error('User not found');
        }
        const user = userResult.rows[0];

        const transferId = `trf_${Date.now()}`;
        let status = 'processing';
        let blockedStep = 0;

        if (transferData.amount > 10000) {
            status = 'blocked';
            blockedStep = 1;
        } else {
            status = 'completed';
            await client.query(
                'UPDATE users SET balance = balance - $1 WHERE id = $2',
                [transferData.amount, transferData.userId]
            );
        }

        const result = await client.query(
            `INSERT INTO transfers (id, user_id, amount, account_holder_name, account_number, routing_number, reason, status, blocked_step)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [transferId, transferData.userId, transferData.amount, transferData.accountHolderName,
             transferData.accountNumber, transferData.routingNumber, transferData.reason, status, blockedStep]
        );

        await client.query('COMMIT');
        
        const updatedUserResult = await client.query('SELECT * FROM users WHERE id = $1', [transferData.userId]);
        const updatedUser = updatedUserResult.rows[0];
        const { password, ...userWithoutPassword } = updatedUser;
        
        return { newTransfer: result.rows[0], updatedUser: userWithoutPassword };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export const updateTransfer = async (id, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    const result = await pool.query(
        `UPDATE transfers SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, id]
    );
    
    return result.rows[0];
};

// Unlock Codes
export const generateUnlockCode = async (transferId, stepNumber) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const codeId = `code_${Date.now()}`;
    const expiresAt = new Date(new Date().getTime() + 10 * 60 * 1000);

    await pool.query(
        'INSERT INTO unlock_codes (id, transfer_id, step_number, code, used, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
        [codeId, transferId, stepNumber, code, false, expiresAt]
    );

    return code;
};

export const verifyUnlockCode = async (transferId, step, code) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const result = await client.query(
            'SELECT * FROM unlock_codes WHERE transfer_id = $1 AND step_number = $2 AND code = $3 AND used = false',
            [transferId, step, code]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false };
        }

        await client.query(
            'UPDATE unlock_codes SET used = true WHERE id = $1',
            [result.rows[0].id]
        );

        const transferResult = await client.query(
            'SELECT * FROM transfers WHERE id = $1',
            [transferId]
        );
        const transfer = transferResult.rows[0];

        if (step < 4) {
            await client.query(
                'UPDATE transfers SET blocked_step = $1 WHERE id = $2',
                [step + 1, transferId]
            );
        } else {
            await client.query(
                'UPDATE transfers SET status = $1, blocked_step = $2 WHERE id = $3',
                ['completed', 0, transferId]
            );
            await client.query(
                'UPDATE users SET balance = balance - $1 WHERE id = $2',
                [transfer.amount, transfer.user_id]
            );
        }

        await client.query('COMMIT');
        
        const userResult = await client.query('SELECT * FROM users WHERE id = $1', [transfer.user_id]);
        const user = userResult.rows[0];
        const { password, ...userWithoutPassword } = user;
        
        return { success: true, updatedUser: userWithoutPassword };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Credit Requests
export const getCreditRequests = async () => {
    const result = await pool.query('SELECT * FROM credit_requests ORDER BY created_at DESC');
    return result.rows;
};

export const getCreditRequestsByUserId = async (userId) => {
    const result = await pool.query(
        'SELECT * FROM credit_requests WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows;
};

export const createCreditRequest = async (requestData) => {
    const requestId = `cr_${Date.now()}`;
    
    const result = await pool.query(
        'INSERT INTO credit_requests (id, user_id, amount, reason, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [requestId, requestData.userId, requestData.amount, requestData.reason, 'pending']
    );

    return result.rows[0];
};

export const updateCreditRequest = async (id, updates) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const currentResult = await client.query('SELECT * FROM credit_requests WHERE id = $1', [id]);
        if (currentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return null;
        }
        
        const originalRequest = currentResult.rows[0];
        
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        
        const result = await client.query(
            `UPDATE credit_requests SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
            [...values, id]
        );

        const updatedRequest = result.rows[0];

        if (updates.status === 'approved' && originalRequest.status !== 'approved') {
            await client.query(
                'UPDATE users SET balance = balance + $1 WHERE id = $2',
                [originalRequest.amount, originalRequest.user_id]
            );
            
            await client.query('COMMIT');
            
            const userResult = await client.query('SELECT * FROM users WHERE id = $1', [originalRequest.user_id]);
            const user = userResult.rows[0];
            const { password, ...userWithoutPassword } = user;
            
            return { updatedRequest, updatedUser: userWithoutPassword };
        }

        await client.query('COMMIT');
        return { updatedRequest };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Chat
export const getAllChatSessions = async () => {
    const result = await pool.query('SELECT * FROM chat_messages ORDER BY user_id, created_at');
    const sessions = {};
    
    for (const message of result.rows) {
        if (!sessions[message.user_id]) {
            sessions[message.user_id] = [];
        }
        sessions[message.user_id].push({
            sender: message.sender,
            text: message.text
        });
    }
    
    return sessions;
};

export const getChatSessionByUserId = async (userId) => {
    const result = await pool.query(
        'SELECT * FROM chat_messages WHERE user_id = $1 ORDER BY created_at',
        [userId]
    );
    
    return result.rows.map(row => ({
        sender: row.sender,
        text: row.text
    }));
};

export const addChatMessage = async (userId, message) => {
    await pool.query(
        'INSERT INTO chat_messages (user_id, sender, text) VALUES ($1, $2, $3)',
        [userId, message.sender, message.text]
    );
};

// Settings
export const getBlockStepMessages = async () => {
    const result = await pool.query(
        'SELECT value FROM settings WHERE key = $1',
        ['block_step_messages']
    );
    
    if (result.rows.length === 0) {
        return [
            'For your security, this transfer has been temporarily paused. Please provide the first verification code to proceed.',
            'Thank you. As an additional security measure, a second verification is required. Please provide the next code.',
            'Almost there. We need one final verification to complete your transfer. Please provide the final code.',
            'Final security step pending. The transaction will be processed after this verification.',
        ];
    }
    
    return JSON.parse(result.rows[0].value);
};

export const updateBlockStepMessages = async (messages) => {
    await pool.query(
        'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW()) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        ['block_step_messages', JSON.stringify(messages)]
    );
};
