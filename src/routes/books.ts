import type { HttpBindings } from "@hono/node-server";
import { Hono } from "hono";
import { env } from "../config/env";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { uploadedFiles } from "../db/schema/uploads";
import { books, BookCreateSchema } from "../db/schema/books";
import { db } from "../db";
import { eq, and, sql } from "drizzle-orm";
import { processFile } from "../worker/fileProcessor";
import { runWorker } from "../worker/worker";

// Define user role type
type Role = "admin" | "user";

type UserSession = {
  id: string;
  email: string;
  role: Role;
};

export const booksRoutes = new Hono<{
  Bindings: HttpBindings & {
    ENV: typeof env;
    user: UserSession | null;
  };
}>();

// 🔐 Auth middleware for all /books/* routes
booksRoutes.use("*", async (c, next) => {
  const user = c.env.user;
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

// ✅ GET books – logged in users
booksRoutes.get("/", async (c) => {
  const user = c.env.user!;
  // Fetch all books uploaded by this user
  const userBooks = await db
    .select()
    .from(books)
    .where(eq(books.userId, user.id));
  return c.json({ books: userBooks });
});

// ✅ POST book – only admin can upload
booksRoutes.post("/", async (c) => {
  const user = c.env.user!;
  if (user.role !== "admin") {
    return c.json({ error: "Forbidden: Admins only" }, 403);
  }

  // Validate form fields (except file) using BookCreateSchema
  const body = await c.req.parseBody();
  const file = body?.file;

  // Extract fields for validation (customize as needed)
  let parsedTags: string[] = [];
  if (typeof body.tags === "string") {
    // Accept comma-separated string and convert to array
    parsedTags = body.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
  } else if (Array.isArray(body.tags)) {
    parsedTags = body.tags;
  }

  const bookFields = {
    title: body.title, // using filename as title
    author: body.author,
    genre: body.genre,
    language: body.language || "en",
    description: body.description || "",
    tags: parsedTags,
    difficulty: body.difficulty,
    audience: body.audience,
    isbn: body.isbn,
    edition: body.edition,
    pageCount: body.pageCount ? Number(body.pageCount) : undefined,
    coverImageUrl: body.coverImageUrl,
    chapterOverview: body.chapterOverview,
    learningObjectives: body.learningObjectives,
    isPublic: body.isPublic === "true",
  };

  const parseResult = BookCreateSchema.safeParse(bookFields);
  if (!parseResult.success) {
    return c.json(
      { error: "Invalid book data", details: parseResult.error.format() },
      400
    );
  }

  if (!(file instanceof File)) {
    return c.json({ error: "No valid file uploaded" }, 400);
  }

  const fileName = file.name;
  const userFolder = join(process.cwd(), "uploads", user.id);
  const fullFilePath = join(userFolder, fileName);

  // 📌 Step 1: Check for duplicate book entry
  const existingBook = await db
    .select()
    .from(books)
    .where(
      and(
        eq(books.userId, user.id),
        eq(books.title, fileName) // using filename as title
      )
    )
    .then((rows) => rows[0]);

  if (existingBook) {
    return c.json(
      {
        error: `Book "${fileName}" already exists.`,
      },
      409
    );
  }

  // ✅ Create directory if not exists
  await mkdir(userFolder, { recursive: true });

  // ✅ Save file to disk
  const buffer = await file.arrayBuffer();
  await writeFile(fullFilePath, Buffer.from(buffer));

  // ✅ Step 2: Insert uploaded file record first
  const insertedFile = await db
    .insert(uploadedFiles)
    .values({
      userId: user.id,
      fileName,
      filePath: fullFilePath,
      status: "pending",
    })
    .returning({ id: uploadedFiles.id });

  const uploadedFileId = insertedFile[0]?.id;
  if (!uploadedFileId) {
    return c.json({ error: "Failed to insert uploaded file record" }, 500);
  }

  // ✅ Step 3: Insert book with uploadedFileId and all validated fields
  const insertedBook = await db
    .insert(books)
    .values({
      userId: user.id,
      uploadedFileId,
      ...parseResult.data, // all validated fields from Zod
    })
    .returning({ id: books.id });

  const bookId = insertedBook[0]?.id;
  if (!bookId) {
    return c.json({ error: "Failed to insert book" }, 500);
  }

  return c.json({
    message: "Book uploaded and ready for processing",
    filename: fileName,
    storedAt: fullFilePath,
    bookId,
    uploadedFileId,
  });
});

// ✅ DELETE book – only admin
booksRoutes.delete("/", (c) => {
  const user = c.env.user!;
  if (user.role !== "admin") {
    return c.json({ error: "Forbidden: Admins only" }, 403);
  }

  return c.json({ message: "Book deleted by admin!" });
});

// ✅ Admin: Process all books (all users)
booksRoutes.post("/process-all", async (c) => {
  const user = c.env.user!;
  if (user.role !== "admin") {
    return c.json({ error: "Forbidden: Admins only" }, 403);
  }
  // Trigger the worker to process all books (no userId)
  await runWorker();
  return c.json({ message: "All books processed (worker triggered)." });
});

// ✅ Admin/User: Process all books uploaded by the user
booksRoutes.post("/process", async (c) => {
  const user = c.env.user!;
  // Trigger the worker to process all books for this user
  await runWorker(user.id);
  return c.json({ message: "All your books processed (worker triggered)." });
});

// ✅ Admin/User: Process a single book by ID
booksRoutes.post(":bookId/process", async (c) => {
  const user = c.env.user!;
  const { bookId } = c.req.param();
  // Find the book
  const book = await db.select().from(books).where(eq(books.id, bookId)).then(rows => rows[0]);
  if (!book) return c.json({ error: "Book not found" }, 404);
  // Only admin or owner can process
  if (user.role !== "admin" && book.userId !== user.id) {
    return c.json({ error: "Forbidden: Not allowed" }, 403);
  }
  if (!book.uploadedFileId) {
    return c.json({ error: "No uploaded file for this book" }, 400);
  }
  
  // Find the uploaded file and check its status
  const uploadedFile = await db
    .select()
    .from(uploadedFiles)
    .where(eq(uploadedFiles.id, book.uploadedFileId))
    .then(rows => rows[0]);
  if (!uploadedFile) return c.json({ error: "Uploaded file not found" }, 404);
  if (uploadedFile.status !== "pending") {
    return c.json({ error: `File already processed (status: ${uploadedFile.status})` }, 400);
  }
  // Process only this file
  await processFile(book.userId, uploadedFile.fileName);
  return c.json({ message: `Book ${bookId} processed.` });
});
