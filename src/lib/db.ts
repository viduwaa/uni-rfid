// lib/db.ts
import fs from 'fs';
import pg from 'pg';
import url from 'url';
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create a connection pool
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL_CERT_PATH ? {
        ca: fs.readFileSync(process.env.DB_SSL_CERT_PATH).toString(),
    } : undefined
};

const pool = new pg.Pool(config);

// Test the connection
pool.on("connect", () => {
    console.log("Connected to Aiven PostgreSQL database");
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});

export { pool };
