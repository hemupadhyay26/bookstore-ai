import { getPendingFiles } from "./fileScanner";
import { processFile } from "./fileProcessor";

/**
 * Processes all pending files.
 * @param userId Optional user ID to scope processing.
 */
export async function runWorker(userId?: string) {
  try {
    const files = await getPendingFiles(userId);

    if (!files.length) {
      console.log("[Worker] ✅ No unprocessed files found.");
      return;
    }

    for (const file of files) {
      try {
        console.log(`[Worker] 📄 Processing ${file.fileName} (User: ${file.userId})`);
        await processFile(file.userId, file.fileName);
        console.log(`[Worker ✅] Done: ${file.fileName}`);
      } catch (err) {
        console.error(`[Worker ❌] Failed: ${file.fileName}`, err);
      }
    }

  } catch (err) {
    console.error("[Worker ❌] Fatal error:", err);
    throw err;
  }
}

// // CLI entry point
// if (import.meta.url === process.argv[1] || import.meta.url === `file://${process.argv[1]}`) {
//   const userId = process.argv[2]; // optional CLI argument
//   runWorker(userId)
//     .then(() => process.exit(0))
//     .catch(() => process.exit(1));
// }