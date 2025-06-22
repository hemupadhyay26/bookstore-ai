import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { uploadedFiles } from "./uploads";
import { z } from "zod";

export const books = pgTable("books", {
  id: uuid("id").defaultRandom().primaryKey(),

  // 🔗 Relations
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  uploadedFileId: uuid("uploaded_file_id")
    .references(() => uploadedFiles.id, { onDelete: "set null" }),

  // 📚 Metadata
  title: text("title").notNull(),
  author: text("author").notNull(),
  genre: text("genre").notNull(),
  language: text("language").notNull(),

  description: text("description").notNull(),
  tags: text("tags").array().default([]),
  difficulty: text("difficulty"),
  audience: text("audience"),
  isbn: text("isbn"),
  edition: text("edition"),
  pageCount: integer("page_count"),

  coverImageUrl: text("cover_image_url"),
  chapterOverview: text("chapter_overview"),
  learningObjectives: text("learning_objectives"),

  isPublic: boolean("is_public").default(false),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Zod schema for book creation validation
export const BookCreateSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  genre: z.string().min(1),
  language: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
  audience: z.string().optional(),
  isbn: z.string().optional(),
  edition: z.string().optional(),
  pageCount: z.number().optional(),
  coverImageUrl: z.string().optional(),
  chapterOverview: z.string().optional(),
  learningObjectives: z.string().optional(),
  isPublic: z.boolean().optional(),
  uploadedFileId: z.string().uuid().optional(),
});

export type BookCreateInput = z.infer<typeof BookCreateSchema>;
