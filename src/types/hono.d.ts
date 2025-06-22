import type { HttpBindings } from "@hono/node-server";
import type { env } from "../src/config/env";

declare module "hono" {
  interface ContextVariableMap {
    Bindings: HttpBindings & {
      ENV: typeof env;
    };
  }
}
