import { Request, Response } from 'express'
import { SearchService } from '../services/search.service.js'

const searchService = new SearchService()

export const search = async (req: Request, res: Response) => {
  try {
    const { q, type } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: 'Query parameter "q" is required' })
    }

    const searchType = type === 'music' || type === 'video' ? type : 'all'
    const results = await searchService.search(q, searchType)
    return res.json(results)
  } catch (error: any) {
    console.error('Search error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}







