ALTER TABLE "media_config"
  ADD COLUMN IF NOT EXISTS "subtitlesPath" TEXT
  NOT NULL DEFAULT '/var/www/flixtv/storage/media/subtitles';
