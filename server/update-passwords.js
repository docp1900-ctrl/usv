import pg from 'pg';

const { Pool } = pg;

async function updatePasswords() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Updating passwords in database...');
        
        const clientHash = '$2b$10$oZM0UMnufUpyA2Esz3q1beYjZEUuxA.r9kZvTueM7a4pMiuuHjt5W';
        const adminHash = '$2b$10$nrV6mBBmkU9XH6yPfSkMDuYi24rMUYpglHpoxrCZcXv733SZ3kYHC';
        
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [adminHash, 'admin@usalli.com']
        );
        console.log('✓ Updated admin@usalli.com');
        
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [clientHash, 'client@usalli.com']
        );
        console.log('✓ Updated client@usalli.com');
        
        await pool.query(
            'UPDATE users SET password = $1 WHERE email = $2',
            [clientHash, 'maria@usalli.com']
        );
        console.log('✓ Updated maria@usalli.com');
        
        console.log('\nPasswords updated successfully!');
        console.log('Test Credentials:');
        console.log('  Client: client@usalli.com / ClientPass123!');
        console.log('  Client: maria@usalli.com / ClientPass123!');
        console.log('  Admin:  admin@usalli.com / AdminPass123!');
        
    } catch (error) {
        console.error('Error updating passwords:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

updatePasswords();
