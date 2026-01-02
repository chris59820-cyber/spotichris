/**
 * Script pour corriger les mots de passe des utilisateurs de test
 * Usage: tsx src/db/scripts/fix-passwords.ts
 */

import pool from '../../config/database.js'
import bcrypt from 'bcryptjs'

async function fixPasswords() {
  const client = await pool.connect()
  
  try {
    console.log('🔧 Fixing user passwords...')
    
    const correctHash = await bcrypt.hash('password123', 10)
    console.log('📝 Generated hash:', correctHash)
    
    // Mettre à jour tous les utilisateurs de test avec le nouveau hash
    const users = ['admin@spotichris.com', 'user@spotichris.com', 'demo@spotichris.com']
    
    for (const email of users) {
      const result = await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING email',
        [correctHash, email]
      )
      
      if (result.rows.length > 0) {
        console.log(`✅ Updated password for ${email}`)
      } else {
        console.log(`⚠️  User ${email} not found`)
      }
    }
    
    console.log('\n✅ All passwords fixed!')
    console.log('You can now login with:')
    console.log('  - Email: admin@spotichris.com')
    console.log('  - Password: password123')
    
  } catch (error: any) {
    console.error('❌ Error fixing passwords:', error.message)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

fixPasswords()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))







