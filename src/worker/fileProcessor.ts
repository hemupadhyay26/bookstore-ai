import path from "path";
import fs from "fs/promises";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { embeddings } from "./embeddings";
import { supabaseClient } from "./supabaseClient";
import { db } from "../db";
import { uploadedFiles } from "../db/schema/uploads";
import { and, eq } from "drizzle-orm";
import { UPLOADS_DIR } from "./config";

export async function processFile(userId: string, fileName: string) {
  const filePath = path.join(UPLOADS_DIR, userId, fileName);

  const loader = new PDFLoader(filePath);
  const rawDocs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const docs = await splitter.splitDocuments(rawDocs);

  const structuredDocs = docs.map((doc, idx) => {
    doc.metadata = {
      userId,
      fileName,
      chunkIndex: idx,
      source: `${userId}/${fileName}`,
    };
    return doc;
  });

  await SupabaseVectorStore.fromDocuments(structuredDocs, embeddings, {
    client: supabaseClient,
    tableName: "documents",
    queryName: "match_documents",
  });

  await db
    .update(uploadedFiles)
    .set({ status: "processed" })
    .where(and(eq(uploadedFiles.userId, userId), eq(uploadedFiles.fileName, fileName)));
}
