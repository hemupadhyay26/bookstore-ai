import { Context, Next } from 'hono';
import { getCookie, deleteCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getUserFromRequest } from '../utils/getUserFromRequest';

export async function authMiddleware(c: Context, next: Next) {
  const token = getCookie(c, 'sb:token') || getCookie(c, 'access_token');
  
  if (token) {
    try {
      jwt.verify(token, env.SUPABASE_JWT_SECRET!);
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        // Clear expired token
        deleteCookie(c, 'sb:token');
        deleteCookie(c, 'access_token');
      }
    }
  }

  // Attach user to context
  const user = await getUserFromRequest(c);
  c.env.user = user;

  await next();
}