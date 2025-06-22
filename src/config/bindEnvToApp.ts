import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { env } from "./env.js";

export const bindEnvToApp = (
  app: Hono<{ Bindings: HttpBindings & { ENV: typeof env } }>
) => {
  // Use middleware to inject env globally
  app.use("*", async (c, next) => {
    c.env.ENV = env;
    await next();
  });
};
