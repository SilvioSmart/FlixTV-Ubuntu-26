DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'program_episodes'
      AND column_name = 'episodeCode'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'program_episodes'
      AND column_name = 'IDepisode'
  ) THEN
    ALTER TABLE "program_episodes" RENAME COLUMN "episodeCode" TO "IDepisode";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'program_episodes'
      AND column_name = 'seriesId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'program_episodes'
      AND column_name = 'IDstagione'
  ) THEN
    ALTER TABLE "program_episodes" RENAME COLUMN "seriesId" TO "IDstagione";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'program_episodes'
      AND column_name = 'IDprogramma'
  ) THEN
    ALTER TABLE "program_episodes" ADD COLUMN "IDprogramma" VARCHAR(6);
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'program_episodes'
      AND column_name = 'seasonId'
  ) THEN
    UPDATE "program_episodes" AS episode
    SET
      "IDprogramma" = program."IDprogramma",
      "IDstagione" = program."IDstagione"
    FROM "programmi" AS program
    WHERE episode."seasonId" = program."id";
  END IF;
END
$$;

ALTER TABLE "program_episodes"
  DROP CONSTRAINT IF EXISTS "program_episodes_seasonId_fkey";

CREATE UNIQUE INDEX IF NOT EXISTS "programmi_IDstagione_key"
  ON "programmi" ("IDstagione");

ALTER TABLE "program_episodes"
  ALTER COLUMN "IDepisode" TYPE VARCHAR(6),
  ALTER COLUMN "IDprogramma" TYPE VARCHAR(6),
  ALTER COLUMN "IDstagione" TYPE VARCHAR(6),
  ALTER COLUMN "IDprogramma" SET NOT NULL,
  ALTER COLUMN "IDstagione" SET NOT NULL;

ALTER TABLE "program_episodes"
  DROP COLUMN IF EXISTS "seasonId";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'program_episodes'
      AND constraint_name = 'program_episodes_IDstagione_fkey'
  ) THEN
    ALTER TABLE "program_episodes"
      ADD CONSTRAINT "program_episodes_IDstagione_fkey"
      FOREIGN KEY ("IDstagione")
      REFERENCES "programmi" ("IDstagione")
      ON DELETE CASCADE
      ON UPDATE CASCADE;
  END IF;
END
$$;
