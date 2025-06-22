import { db } from "../db";
import { uploadedFiles } from "../db/schema/uploads";
import { eq, and } from "drizzle-orm";

export async function getPendingFiles(userId?: string) {
  return db
    .select()
    .from(uploadedFiles)
    .where(userId ? and(eq(uploadedFiles.userId, userId), eq(uploadedFiles.status, "pending")) : eq(uploadedFiles.status, "pending"));
}
