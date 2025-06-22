import { env } from "../config/env";
import path from "path";

export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

export const BEDROCK_REGION = env.BEDROCK_AWS_REGION;
export const BEDROCK_ACCESS_KEY = env.BEDROCK_AWS_ACCESS_KEY_ID;
export const BEDROCK_SECRET_KEY = env.BEDROCK_AWS_SECRET_ACCESS_KEY;