/**
 * Script utilitaire pour générer des hash bcrypt pour les mots de passe
 * Usage: tsx src/db/scripts/create-bcrypt-hash.ts <password>
 */

import bcrypt from 'bcryptjs'

const password = process.argv[2] || 'password123'

async function generateHash() {
  try {
    const hash = await bcrypt.hash(password, 10)
    console.log(`\nPassword: ${password}`)
    console.log(`Hash: ${hash}\n`)
    console.log('Vous pouvez utiliser ce hash dans le fichier seed SQL.')
  } catch (error) {
    console.error('Error generating hash:', error)
    process.exit(1)
  }
}

generateHash()







