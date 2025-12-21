-- Seed data for testing

-- Insert test users (password is 'password123' hashed with bcrypt)
-- Hash généré avec: npm run db:hash password123
-- Note: Ce hash est pour les tests uniquement. En production, générez vos propres hashs.
-- Hash bcrypt valide pour 'password123': $2a$10$W6P0Vcte6M7d3irOAiwZxOIcaYtRsL.jPAzU.6qfW2oGM4gcql80K
-- Si les utilisateurs existent déjà, on les met à jour avec le bon hash
INSERT INTO users (email, username, password_hash, created_at, updated_at) VALUES
('admin@spotichris.com', 'admin', '$2a$10$W6P0Vcte6M7d3irOAiwZxOIcaYtRsL.jPAzU.6qfW2oGM4gcql80K', NOW(), NOW()),
('user@spotichris.com', 'testuser', '$2a$10$W6P0Vcte6M7d3irOAiwZxOIcaYtRsL.jPAzU.6qfW2oGM4gcql80K', NOW(), NOW()),
('demo@spotichris.com', 'demo', '$2a$10$W6P0Vcte6M7d3irOAiwZxOIcaYtRsL.jPAzU.6qfW2oGM4gcql80K', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Insert test music tracks
INSERT INTO media (title, description, artist, album, duration, type, url, thumbnail_url, created_at, updated_at) VALUES
-- Pop/Rock
('Bohemian Rhapsody', 'One of the greatest rock songs of all time', 'Queen', 'A Night at the Opera', 355, 'music', 'https://example.com/audio/bohemian-rhapsody.mp3', 'https://example.com/images/queen-a-night-at-opera.jpg', NOW(), NOW()),
('Stairway to Heaven', 'Classic rock masterpiece', 'Led Zeppelin', 'Led Zeppelin IV', 482, 'music', 'https://example.com/audio/stairway-to-heaven.mp3', 'https://example.com/images/led-zeppelin-iv.jpg', NOW(), NOW()),
('Hotel California', 'Iconic Eagles track', 'Eagles', 'Hotel California', 391, 'music', 'https://example.com/audio/hotel-california.mp3', 'https://example.com/images/eagles-hotel-california.jpg', NOW(), NOW()),

-- Electronic
('One More Time', 'Electronic dance anthem', 'Daft Punk', 'Discovery', 320, 'music', 'https://example.com/audio/one-more-time.mp3', 'https://example.com/images/daft-punk-discovery.jpg', NOW(), NOW()),
('Strobe', 'Progressive house classic', 'deadmau5', 'For Lack of a Better Name', 637, 'music', 'https://example.com/audio/strobe.mp3', 'https://example.com/images/deadmau5-floabn.jpg', NOW(), NOW()),

-- Hip-Hop
('Lose Yourself', 'Motivational rap anthem', 'Eminem', '8 Mile Soundtrack', 326, 'music', 'https://example.com/audio/lose-yourself.mp3', 'https://example.com/images/eminem-8-mile.jpg', NOW(), NOW()),
('Juicy', 'Classic hip-hop track', 'The Notorious B.I.G.', 'Ready to Die', 318, 'music', 'https://example.com/audio/juicy.mp3', 'https://example.com/images/big-ready-to-die.jpg', NOW(), NOW()),

-- Jazz
('Take Five', 'Jazz standard', 'Dave Brubeck Quartet', 'Time Out', 324, 'music', 'https://example.com/audio/take-five.mp3', 'https://example.com/images/brubeck-time-out.jpg', NOW(), NOW()),
('So What', 'Modal jazz masterpiece', 'Miles Davis', 'Kind of Blue', 542, 'music', 'https://example.com/audio/so-what.mp3', 'https://example.com/images/miles-davis-kind-of-blue.jpg', NOW(), NOW()),

-- Classical
('Claire de Lune', 'Impressionist piano piece', 'Claude Debussy', 'Suite Bergamasque', 300, 'music', 'https://example.com/audio/claire-de-lune.mp3', 'https://example.com/images/debussy-suite-bergamasque.jpg', NOW(), NOW()),
('Für Elise', 'Famous piano composition', 'Ludwig van Beethoven', 'Bagatelle No. 25', 180, 'music', 'https://example.com/audio/fur-elise.mp3', 'https://example.com/images/beethoven-fur-elise.jpg', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert test video content
INSERT INTO media (title, description, duration, type, url, thumbnail_url, created_at, updated_at) VALUES
-- Movies
('The Matrix', 'A computer hacker learns about the true nature of reality', 8160, 'video', 'https://example.com/video/matrix.mp4', 'https://example.com/images/matrix.jpg', NOW(), NOW()),
('Inception', 'A thief enters peoples dreams to steal secrets', 8880, 'video', 'https://example.com/video/inception.mp4', 'https://example.com/images/inception.jpg', NOW(), NOW()),
('Interstellar', 'A team of explorers travel through a wormhole in space', 10140, 'video', 'https://example.com/video/interstellar.mp4', 'https://example.com/images/interstellar.jpg', NOW(), NOW()),
('The Dark Knight', 'Batman faces the Joker in Gotham City', 9120, 'video', 'https://example.com/video/dark-knight.mp4', 'https://example.com/images/dark-knight.jpg', NOW(), NOW()),

-- TV Series
('Breaking Bad S01E01', 'Pilot episode of the acclaimed series', 3158, 'video', 'https://example.com/video/breaking-bad-s01e01.mp4', 'https://example.com/images/breaking-bad.jpg', NOW(), NOW()),
('Game of Thrones S01E01', 'The series premiere', 3600, 'video', 'https://example.com/video/got-s01e01.mp4', 'https://example.com/images/game-of-thrones.jpg', NOW(), NOW()),
('Stranger Things S01E01', 'The first episode of the supernatural series', 2880, 'video', 'https://example.com/video/stranger-things-s01e01.mp4', 'https://example.com/images/stranger-things.jpg', NOW(), NOW()),

-- Documentaries
('Planet Earth: Mountains', 'Documentary about mountain ecosystems', 3600, 'video', 'https://example.com/video/planet-earth-mountains.mp4', 'https://example.com/images/planet-earth.jpg', NOW(), NOW()),
('Cosmos: A Spacetime Odyssey', 'Episode about the cosmos', 2640, 'video', 'https://example.com/video/cosmos.mp4', 'https://example.com/images/cosmos.jpg', NOW(), NOW()),

-- Music Videos
('Bohemian Rhapsody (Official Video)', 'The iconic music video', 355, 'video', 'https://example.com/video/bohemian-rhapsody-video.mp4', 'https://example.com/images/bohemian-rhapsody-video.jpg', NOW(), NOW()),
('One More Time (Official Video)', 'Daft Punk music video', 320, 'video', 'https://example.com/video/one-more-time-video.mp4', 'https://example.com/images/one-more-time-video.jpg', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create some test playlists for testuser
INSERT INTO playlists (user_id, name, description, is_public, created_at, updated_at)
SELECT 
  u.id,
  playlist_data.name,
  playlist_data.description,
  playlist_data.is_public,
  NOW(),
  NOW()
FROM users u
CROSS JOIN (VALUES
  ('My Favorites', 'My favorite tracks', true),
  ('Workout Mix', 'High energy songs for workouts', false),
  ('Chill Vibes', 'Relaxing music for unwinding', true),
  ('Classic Rock', 'The best classic rock songs', true)
) AS playlist_data(name, description, is_public)
WHERE u.username = 'testuser'
ON CONFLICT DO NOTHING;

-- Add some tracks to playlists (first 5 music tracks to My Favorites)
INSERT INTO playlist_items (playlist_id, media_id, position, added_at)
SELECT 
  p.id,
  m.id,
  ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY m.id),
  NOW()
FROM playlists p
CROSS JOIN (
  SELECT id FROM media WHERE type = 'music' ORDER BY id LIMIT 5
) m
WHERE p.name = 'My Favorites'
  AND EXISTS (SELECT 1 FROM users WHERE id = p.user_id AND username = 'testuser')
ON CONFLICT DO NOTHING;

-- Add some favorites and history for test user (first 8 music tracks)
INSERT INTO user_media (user_id, media_id, is_favorite, is_downloaded, last_played_at, play_count, created_at)
SELECT 
  u.id,
  m.id,
  (m.id % 3 = 0) as is_favorite,
  (m.id % 5 = 0) as is_downloaded,
  NOW() - (random() * INTERVAL '30 days'),
  FLOOR(random() * 10)::INTEGER + 1,
  NOW() - (random() * INTERVAL '60 days')
FROM users u
CROSS JOIN (
  SELECT id FROM media WHERE type = 'music' ORDER BY id LIMIT 8
) m
WHERE u.username = 'testuser'
ON CONFLICT (user_id, media_id) DO NOTHING;
