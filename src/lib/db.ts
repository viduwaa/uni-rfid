// lib/db.ts
import fs from 'fs';
import pg from 'pg';
import url from 'url';
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create a connection pool
const config = {
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : undefined,
    database: process.env.PGNAME,
    ssl: {
    rejectUnauthorized: false
  }
};

const pool = new pg.Pool(config);

// Test the connection
pool.on("connect", () => {
    console.log("Connected to Azure PostgreSQL database");
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});

export { pool };
