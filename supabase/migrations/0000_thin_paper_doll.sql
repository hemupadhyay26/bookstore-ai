CREATE TYPE "public"."book_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"file_url" text NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"visibility" "book_visibility" DEFAULT 'private',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "uploaded_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_path" text NOT NULL,
	"status" text DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uploaded_files_user_id_file_name_unique" UNIQUE("user_id","file_name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"avatar_url" text,
	"role" "user_role" DEFAULT 'user',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "books" ADD CONSTRAINT "books_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;