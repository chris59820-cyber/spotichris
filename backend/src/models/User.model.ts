import pool from '../config/database'

export interface User {
  id: number
  email: string
  username?: string
  password_hash: string
  created_at: Date
  updated_at: Date
}

export interface CreateUserData {
  email: string
  username?: string
  password: string
}

export class UserModel {
  static async create(data: CreateUserData): Promise<User> {
    const { email, username, password } = data
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING id, email, username, password_hash, created_at, updated_at`,
      [email, username || null, password]
    )
    return result.rows[0]
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0] || null
  }

  static async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      'SELECT id, email, username, created_at, updated_at FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }

  static async update(id: number, data: Partial<CreateUserData>): Promise<User> {
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.email) {
      updates.push(`email = $${paramCount++}`)
      values.push(data.email)
    }
    if (data.username !== undefined) {
      updates.push(`username = $${paramCount++}`)
      values.push(data.username)
    }
    if (data.password) {
      updates.push(`password_hash = $${paramCount++}`)
      values.push(data.password)
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, username, password_hash, created_at, updated_at`,
      values
    )
    return result.rows[0]
  }
}






