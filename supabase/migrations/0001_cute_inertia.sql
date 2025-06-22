ALTER TABLE "books" DROP CONSTRAINT "books_uploaded_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "books" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "uploaded_file_id" uuid;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "author" text NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "genre" text NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "language" text NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "tags" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "difficulty" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "audience" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "isbn" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "edition" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "page_count" integer;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "chapter_overview" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "learning_objectives" text;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_uploaded_file_id_uploaded_files_id_fk" FOREIGN KEY ("uploaded_file_id") REFERENCES "public"."uploaded_files"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "file_url";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "uploaded_by";--> statement-breakpoint
ALTER TABLE "books" DROP COLUMN "visibility";--> statement-breakpoint
DROP TYPE "public"."book_visibility";