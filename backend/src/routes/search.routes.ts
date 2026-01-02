import { Router } from 'express'
import { search } from '../controllers/search.controller.js'

export const searchRoutes = Router()

searchRoutes.get('/', search)







