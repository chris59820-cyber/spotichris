-- Add video_category column to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS video_category VARCHAR(50);

-- Add check constraint for valid video categories
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_video_category_check;
ALTER TABLE media ADD CONSTRAINT media_video_category_check 
  CHECK (type = 'music' OR video_category IN ('Cinéma', 'Série', 'Documentaire', 'Musique', 'Sport') OR video_category IS NULL);

-- Create index for video category filtering
CREATE INDEX IF NOT EXISTS idx_media_video_category ON media(video_category);






