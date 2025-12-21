-- Add music_category column to media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS music_category VARCHAR(50);

-- Add check constraint for valid music categories
ALTER TABLE media DROP CONSTRAINT IF EXISTS media_music_category_check;
ALTER TABLE media ADD CONSTRAINT media_music_category_check 
  CHECK (type = 'video' OR music_category IN ('Pop', 'Rock', 'Jazz', 'Classique', 'Hip-Hop', 'Électronique', 'Rap', 'R&B', 'Country', 'Reggae', 'Metal', 'Blues', 'Folk', 'World', 'Autre') OR music_category IS NULL);

-- Create index for music category filtering
CREATE INDEX IF NOT EXISTS idx_media_music_category ON media(music_category);

