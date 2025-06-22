import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as uploadSchema from "./schema/uploads";
import { env } from '../config/env';

const client = postgres(env.DATABASE_URL!);
export const db = drizzle(client, { schema: uploadSchema});
