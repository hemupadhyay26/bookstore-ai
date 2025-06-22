-- Check if enum type exists before creating it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'book_visibility') THEN
    CREATE TYPE "public"."book_visibility" AS ENUM('public', 'private');
  END IF;
END $$;

-- Fix the chunks.book_id column type
DO $$ 
BEGIN
  -- Check if the column exists and is of varchar type
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'chunks' 
    AND column_name = 'book_id' 
    AND data_type = 'character varying'
  ) THEN
    -- Drop the constraint if it exists
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'chunks_book_id_books_id_fk' 
      AND table_name = 'chunks'
    ) THEN
      ALTER TABLE "chunks" DROP CONSTRAINT "chunks_book_id_books_id_fk";
    END IF;
    
    -- Alter the column type to UUID
    ALTER TABLE "chunks" ALTER COLUMN "book_id" TYPE uuid USING "book_id"::uuid;
  END IF;
END $$;

-- Add the foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chunks_book_id_books_id_fk' 
    AND table_name = 'chunks'
  ) THEN
    ALTER TABLE "chunks" 
      ADD CONSTRAINT "chunks_book_id_books_id_fk" 
      FOREIGN KEY ("book_id") 
      REFERENCES "public"."books"("id") 
      ON DELETE NO ACTION 
      ON UPDATE NO ACTION;
  END IF;
END $$;