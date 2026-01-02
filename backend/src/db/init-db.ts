import pool from '../config/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function initDatabase() {
  const client = await pool.connect()

  try {
    console.log('🔄 Initializing database...')

    // Read and execute the migration SQL file
    const migrationSQLPath = path.join(__dirname, 'migrations', '001_initial_schema.sql')
    console.log('📄 Reading migration file:', migrationSQLPath)
    
    if (!fs.existsSync(migrationSQLPath)) {
      throw new Error(`Migration file not found: ${migrationSQLPath}`)
    }
    
    const migrationSQL = fs.readFileSync(migrationSQLPath, 'utf-8')

    console.log('📦 Running migrations...')
    await client.query(migrationSQL)
    console.log('✅ Migrations completed successfully!')

    // Read and execute the seed SQL file
    const seedSQLPath = path.join(__dirname, 'seed', '001_seed_data.sql')
    console.log('📄 Reading seed file:', seedSQLPath)
    
    if (!fs.existsSync(seedSQLPath)) {
      throw new Error(`Seed file not found: ${seedSQLPath}`)
    }
    
    const seedSQL = fs.readFileSync(seedSQLPath, 'utf-8')

    console.log('🌱 Seeding database with test data...')
    
    // Remove comments and split by semicolon, but preserve multi-statement blocks
    // First, remove single-line comments
    let cleanSQL = seedSQL.replace(/--.*$/gm, '')
    
    // Split by semicolon but keep track of statement boundaries
    const statements: string[] = []
    let currentStatement = ''
    let inQuotes = false
    let quoteChar = ''
    
    for (let i = 0; i < cleanSQL.length; i++) {
      const char = cleanSQL[i]
      
      // Track if we're inside quoted strings
      if ((char === '"' || char === "'") && (i === 0 || cleanSQL[i - 1] !== '\\')) {
        if (!inQuotes) {
          inQuotes = true
          quoteChar = char
        } else if (char === quoteChar) {
          inQuotes = false
          quoteChar = ''
        }
      }
      
      currentStatement += char
      
      // If we hit a semicolon and we're not in quotes, it's a statement boundary
      if (char === ';' && !inQuotes) {
        const trimmed = currentStatement.trim()
        if (trimmed.length > 0) {
          statements.push(trimmed)
        }
        currentStatement = ''
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim())
    }

    console.log(`📝 Executing ${statements.length} statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        try {
          await client.query(statement)
        } catch (error: any) {
          // Ignore errors for ON CONFLICT DO NOTHING statements
          if (
            !error.message.includes('duplicate key') &&
            !error.message.includes('already exists') &&
            !error.message.includes('violates foreign key') &&
            !error.message.includes('relation already exists') &&
            (error as any)?.code === '23505' // unique_violation
          ) {
            console.warn(`⚠️  Warning executing statement ${i + 1}: ${error.message.substring(0, 150)}`)
            if (process.env.NODE_ENV === 'development') {
              console.warn(`   Statement: ${statement.substring(0, 200)}...`)
            }
          }
        }
      }
    }

    console.log('✅ Database initialized successfully!')
    console.log('\n📝 Test accounts created:')
    console.log('  - Email: admin@spotichris.com, Password: password123')
    console.log('  - Email: user@spotichris.com, Password: password123')
    console.log('  - Email: demo@spotichris.com, Password: password123')
    console.log('\n🎵 Test data includes:')
    console.log('  - Music tracks (rock, electronic, hip-hop, jazz, classical)')
    console.log('  - Video content (movies, series, documentaries, music videos)')
    console.log('  - Sample playlists')
    console.log('  - User favorites and history')
  } catch (error: any) {
    console.error('❌ Error initializing database:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run if called directly
initDatabase()
  .then(() => {
    console.log('\n✨ Database initialization completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Database initialization failed:', error)
    process.exit(1)
  })

export default initDatabase

