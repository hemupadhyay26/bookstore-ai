import * as dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

export const EnvSchema = z.object({
  QDRANT_URL: z.string().url(),
  PORT: z.string().optional(),      
  NODE_ENV: z.enum(["development", "production", "test"]),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  DATABASE_URL: z.string().url(),
  SUPABASE_JWT_SECRET: z.string(),
  BEDROCK_AWS_ACCESS_KEY_ID: z.string(),
  BEDROCK_AWS_SECRET_ACCESS_KEY: z.string(),
  BEDROCK_AWS_REGION: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
});


export const env = EnvSchema.parse(process.env)
