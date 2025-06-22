import { db } from "../db";
// If using Drizzle ORM, import sql from 'drizzle-orm'
import { sql } from "drizzle-orm";


export function checkDbConnection() {
  try {
    db.execute(sql`SELECT 1`);
    console.log('[DB ✅] Connected to Database');
  } catch (err) {
    console.error('[DB ❌] Failed to connect to Database:', err);
  }
}
