// scripts/init-db.ts
import path from 'path'
import fs from 'fs'
import { pool } from '../lib/db.ts'


async function initTables(){
  try {
    // Read the schema SQL file
    const schemaPath = path.join(process.cwd(), 'schema.sql')
    const schemaSql = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the schema SQL
    await pool.query(schemaSql)
    
    // Close the pool
    await pool.end()
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

async function initDb() {
  try {
    // Test connection
    const result = await pool.query('SELECT version()')
    console.log(result.rows[0].version)
    console.log('Database schema initialized successfully')
    //initialize tables
    await initTables()
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// Run the initialization
initDb()
