import pool from '../../config/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function seedDatabase() {
  const client = await pool.connect()

  try {
    console.log('🌱 Starting database seeding...')

    // Read and execute the seed SQL file
    const seedSQLPath = path.join(__dirname, '001_seed_data.sql')
    const seedSQL = fs.readFileSync(seedSQLPath, 'utf-8')

    // Split by semicolon and execute each statement
    const statements = seedSQL
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      if (statement) {
        try {
          await client.query(statement)
        } catch (error: any) {
          // Ignore errors for ON CONFLICT DO NOTHING statements
          if (!error.message.includes('duplicate key') && !error.message.includes('already exists')) {
            console.warn(`Warning executing statement: ${error.message}`)
          }
        }
      }
    }

    console.log('✅ Database seeded successfully!')
    console.log('\nTest accounts created:')
    console.log('  - Email: admin@spotichris.com, Password: password123')
    console.log('  - Email: user@spotichris.com, Password: password123')
    console.log('  - Email: demo@spotichris.com, Password: password123')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    client.release()
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}

export default seedDatabase

