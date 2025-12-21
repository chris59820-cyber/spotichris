import { MediaModel, Media, CreateMediaData, UpdateMediaData } from '../models/Media.model'
import { NotFoundError } from '../utils/errors'

export interface MediaQueryParams {
  type?: 'music' | 'video'
  limit?: number
  offset?: number
  artist?: string
  music_category?: string
  video_category?: string
}

export interface MediaListResponse {
  data: Media[]
  total: number
  limit: number
  offset: number
}

export class MediaService {
  async getAll(params: MediaQueryParams = {}): Promise<MediaListResponse> {
    const { type, limit = 50, offset = 0, artist, music_category, video_category } = params

    // Get total count for pagination
    const total = await MediaModel.count(type ? { type, artist, music_category, video_category } : undefined)

    // Get paginated results
    let data: Media[]
    if (type) {
      // For type-specific queries with filters
      const allMedia = await MediaModel.findByType(type, 1000, { artist, music_category, video_category })
      data = allMedia.slice(offset, offset + limit)
    } else {
      // Use the new findAll method for better performance
      data = await MediaModel.findAll(limit, offset)
    }

    return {
      data,
      total,
      limit,
      offset,
    }
  }

  async getById(id: number): Promise<Media> {
    const media = await MediaModel.findById(id)
    if (!media) {
      throw new NotFoundError(`Media with id ${id} not found`)
    }
    return media
  }

  async create(data: CreateMediaData): Promise<Media> {
    return await MediaModel.create(data)
  }

  async getByType(type: 'music' | 'video', limit: number = 50): Promise<Media[]> {
    return await MediaModel.findByType(type, limit)
  }

  async update(id: number, data: UpdateMediaData): Promise<Media> {
    const media = await MediaModel.findById(id)
    if (!media) {
      throw new NotFoundError(`Media with id ${id} not found`)
    }
    return await MediaModel.update(id, data)
  }

  async delete(id: number): Promise<void> {
    const media = await MediaModel.findById(id)
    if (!media) {
      throw new NotFoundError(`Media with id ${id} not found`)
    }
    const deleted = await MediaModel.delete(id)
    if (!deleted) {
      throw new NotFoundError(`Media with id ${id} not found`)
    }
  }
}

