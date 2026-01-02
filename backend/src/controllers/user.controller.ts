import { Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware.js'
import { UserModel } from '../models/User.model.js'
import { NotFoundError } from '../utils/errors.js'

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      throw new NotFoundError('User not found')
    }

    return res.json(user)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const { username, email } = req.body
    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email

    const user = await UserModel.update(userId, updateData)
    return res.json(user)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}







