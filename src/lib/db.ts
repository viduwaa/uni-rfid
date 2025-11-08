import pg from 'pg';
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a connection pool for Neon
const config = {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
    database: process.env.PGDATABASE, // Corrected from PGNAME
    ssl: true // Neon requires an SSL connection
};

const pool = new pg.Pool(config);

// Test the connection
pool.on("connect", () => {
    console.log("Connected to Neon PostgreSQL database via connection pool");
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});

export { pool };