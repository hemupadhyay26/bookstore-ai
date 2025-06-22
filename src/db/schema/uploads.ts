import { pgTable, uuid, text, timestamp, unique } from "drizzle-orm/pg-core";

export const uploadedFiles = pgTable(
  "uploaded_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    status: text("status").default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userFileUnique: unique().on(table.userId, table.fileName),
  })
);