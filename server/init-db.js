import pg from 'pg';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const SALT_ROUNDS = 10;

async function initDatabase() {
    const dbUrl = process.env.DATABASE_URL;
    
    if (!dbUrl) {
        console.error('ERROR: DATABASE_URL environment variable is not set!');
        process.exit(1);
    }
    
    console.log('Connecting to PostgreSQL database...');
    
    const pool = new Pool({
        connectionString: dbUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Creating database schema...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        
        await pool.query(schema);
        console.log('✓ Database schema created successfully!');
        
        console.log('Hashing passwords for default users...');
        const adminPassword = await bcrypt.hash('AdminPass123!', SALT_ROUNDS);
        const clientPassword = await bcrypt.hash('ClientPass123!', SALT_ROUNDS);
        
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [adminPassword, 'admin@usalli.com']
        );
        
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [clientPassword, 'client@usalli.com']
        );
        
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [clientPassword, 'maria@usalli.com']
        );
        
        console.log('✓ Passwords hashed successfully!');
        console.log('✓ Database initialized with default data!');
        console.log('\nTest Credentials:');
        console.log('  Client: client@usalli.com / ClientPass123!');
        console.log('  Client: maria@usalli.com / ClientPass123!');
        console.log('  Admin:  admin@usalli.com / AdminPass123!');
        
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

initDatabase();
