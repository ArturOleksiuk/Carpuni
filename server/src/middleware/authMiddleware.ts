import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserRole } from "../types.js";

interface TokenPayload {
  sub: string;
  role: UserRole;
}

declare module "express-serve-static-core" {
  interface Request {
    authUser?: TokenPayload;
  }
}

export const requireAuth: RequestHandler = (request, response, next) => {
  const header = request.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    response.status(401).json({ message: "Потрібна авторизація" });
    return;
  }

  try {
    request.authUser = jwt.verify(token, env.jwtSecret) as unknown as TokenPayload;
    next();
  } catch {
    response.status(401).json({ message: "Сесія недійсна або застаріла" });
  }
};

export const requireAdmin: RequestHandler = (request, response, next) => {
  if (request.authUser?.role !== UserRole.Admin) {
    response.status(403).json({ message: "Доступ тільки для адміністратора" });
    return;
  }

  next();
};
