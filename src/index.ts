import { serve, type HttpBindings } from "@hono/node-server";
import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { booksRoutes } from "./routes/books";
import { logger } from "hono/logger";
import { env } from "./config/env"; 
import { bindEnvToApp } from "./config/bindEnvToApp";
import { qdrantClient } from "./lib/qdrant";
import { checkDbConnection } from "./utils/checkDb";
import { authRoutes } from "./routes/auth";
import { getUserFromRequest } from "./utils/getUserFromRequest";
import { authMiddleware } from "./middleware/auth";

type User = Awaited<ReturnType<typeof getUserFromRequest>>;

const app = new Hono<{
  Bindings: HttpBindings & { ENV: typeof env; user?: User }
}>().basePath("/api/v1");

checkDbConnection();
bindEnvToApp(app);
app.use(logger());
app.use("*", authMiddleware);


// 📡 Health check & routes
app.get("/", (c) => {
  return c.json({ message: `Hello from ${c.env.ENV.NODE_ENV} environment!` });
});

app.get('/qdrant/health', async (c) => {
  try {
    const res = await qdrantClient.getCollections();
    return c.json({ status: 'ok', collections: res.collections.length });
  } catch (err) {
    return c.json({ status: 'error', error: (err as Error).message }, 500);
  }
});

app.route('/auth', authRoutes);
app.route('/books', booksRoutes);

// 🚀 Server config
const server = serve(
  {
    fetch: app.fetch,
    port: Number(env.PORT) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
    showRoutes(app, { verbose: true });
  }
);

// 🧹 Graceful shutdown
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    process.exit(0);
  });
});
