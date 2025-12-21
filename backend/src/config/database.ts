import pg from 'pg'

const { Pool } = pg

// Configuration de la base de données
// Pour le développement, utilisez des variables d'environnement
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'spotichris',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Test de connexion
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Connected to PostgreSQL database')
  }
})

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err)
  if (process.env.NODE_ENV !== 'test') {
    process.exit(-1)
  }
})

// Helper function to test connection
export async function testConnection(): Promise<boolean> {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Database connection test successful:', result.rows[0].now)
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return false
  }
}

export default pool

