DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programmi'
      AND column_name = 'programCode'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programmi'
      AND column_name = 'IDprogramma'
  ) THEN
    ALTER TABLE "programmi" RENAME COLUMN "programCode" TO "IDprogramma";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programmi'
      AND column_name = 'seasonCode'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programmi'
      AND column_name = 'IDstagione'
  ) THEN
    ALTER TABLE "programmi" RENAME COLUMN "seasonCode" TO "IDstagione";
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programmi'
      AND column_name = 'serie'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programmi'
      AND column_name = 'genere'
  ) THEN
    ALTER TABLE "programmi" RENAME COLUMN "serie" TO "genere";
  END IF;
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programmi'
      AND column_name = 'IDprogramma'
  ) THEN
    ALTER TABLE "programmi" ALTER COLUMN "IDprogramma" TYPE VARCHAR(5);
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'programmi'
      AND column_name = 'IDstagione'
  ) THEN
    ALTER TABLE "programmi" ALTER COLUMN "IDstagione" TYPE VARCHAR(6);
  END IF;
END
$$;
