import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { env } from "../config/env";

const JWT_SECRET = env.SUPABASE_JWT_SECRET!;

export type Role = 'admin' | 'user';

export interface UserSession {
  id: string;
  email: string;
  role: Role;
}

export async function getUserFromRequest(c: any): Promise<UserSession | null> {
  const cookieHeader = c.req.header("cookie");
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  const token = cookies['sb:token'] || cookies['access_token']; // adjust based on how you name it

  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const userId = decoded.sub;
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      role: user.role ?? 'user',
    };
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      console.log("[Auth] Token expired, user needs to re-authenticate");
    }
    return null;
  }
}
