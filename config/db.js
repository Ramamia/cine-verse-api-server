import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// just making sure we actually connect to the db bro
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

// if the db crashes we gotta know about it yk
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
