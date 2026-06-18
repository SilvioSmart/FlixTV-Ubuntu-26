CREATE TABLE IF NOT EXISTS "media_assets" (
  "id" TEXT NOT NULL,
  "mediaType" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" BIGINT NOT NULL,
  "durationSeconds" DOUBLE PRECISION,
  "frameRate" DOUBLE PRECISION,
  "width" INTEGER,
  "height" INTEGER,
  "videoCodec" TEXT,
  "containerFormat" TEXT,
  "audioTracks" JSONB NOT NULL DEFAULT '[]',
  "sourceExists" BOOLEAN NOT NULL DEFAULT true,
  "hlsExists" BOOLEAN NOT NULL DEFAULT false,
  "hlsPath" TEXT,
  "conversionStatus" TEXT NOT NULL DEFAULT 'idle',
  "conversionProgress" INTEGER NOT NULL DEFAULT 0,
  "conversionError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "media_assets_filePath_key"
  ON "media_assets" ("filePath");

CREATE INDEX IF NOT EXISTS "media_assets_mediaType_createdAt_idx"
  ON "media_assets" ("mediaType", "createdAt");

CREATE INDEX IF NOT EXISTS "media_assets_conversionStatus_idx"
  ON "media_assets" ("conversionStatus");
