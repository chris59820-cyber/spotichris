import pool from '../config/database.js'

/**
 * Vérifie que la base de données est accessible et que les tables existent
 */
export async function checkDatabaseSetup(): Promise<{ ok: boolean; error?: string }> {
  try {
    // Test de connexion
    await pool.query('SELECT NOW()')
    
    // Vérifier que les tables principales existent
    const tables = ['users', 'media', 'playlists']
    for (const table of tables) {
      const result = await pool.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      )
      
      if (!result.rows[0].exists) {
        return {
          ok: false,
          error: `La table '${table}' n'existe pas. Exécutez: npm run db:init`,
        }
      }
    }
    
    return { ok: true }
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return {
        ok: false,
        error: 'Impossible de se connecter à PostgreSQL. Vérifiez que le service est démarré.',
      }
    }
    
    if (error.code === '28P01') {
      return {
        ok: false,
        error: 'Identifiants PostgreSQL incorrects. Vérifiez votre fichier .env',
      }
    }
    
    if (error.code === '3D000') {
      return {
        ok: false,
        error: `La base de données '${process.env.DB_NAME || 'spotichris'}' n'existe pas. Créez-la d'abord.`,
      }
    }
    
    return {
      ok: false,
      error: `Erreur de base de données: ${error.message}`,
    }
  }
}








