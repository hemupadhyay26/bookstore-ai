import { env } from "../config/env";
import { createClient } from "@supabase/supabase-js";

export const supabaseClient = createClient(
  env.SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!
);
