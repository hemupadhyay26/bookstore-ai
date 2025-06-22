// src/routes/auth.ts
import { Hono } from "hono";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { db } from "../db";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";
import { setCookie } from "hono/cookie";
import { env } from "../config/env";
import { HttpBindings } from "@hono/node-server/.";

export const authRoutes = new Hono<{
  Bindings: HttpBindings & {
    ENV: typeof env;
  };
}>();

// Zod schema for validation
const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// signup route
authRoutes.post("/signup", async (c) => {
  const body = await c.req.json();
  const result = authSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: result.error.format() }, 400);
  }

  const { email, password } = result.data;

  // 🔒 Check if user already exists in the DB
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser.length > 0) {
    return c.json({ error: "User already exists with this email" }, 409);
  }

  // 🚀 Sign up via Supabase
  const { data: signUpData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return c.json({ error: error.message }, 400);

  const user = signUpData.user;

  if (user) {
    await db.insert(users).values({ id: user.id, email });
  }

  return c.json({ message: "Signup successful", user: user?.email });
});

// Login route

authRoutes.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return c.json({ error: error?.message || "Login failed" }, 401);
  }

  const accessToken = data.session.access_token;

  // Set the cookie
  setCookie(c, "sb:token", accessToken, {
    httpOnly: true,
    secure: c.env.ENV.NODE_ENV === "production",
    path: "/",
    sameSite: "Strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return c.json({ message: "Login successful", user: data.user });
});
