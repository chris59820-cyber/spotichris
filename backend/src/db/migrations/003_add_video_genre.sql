-- Add genre column to media table for video genres
ALTER TABLE media ADD COLUMN IF NOT EXISTS genre VARCHAR(50);

-- Create index for genre filtering
CREATE INDEX IF NOT EXISTS idx_media_genre ON media(genre);







