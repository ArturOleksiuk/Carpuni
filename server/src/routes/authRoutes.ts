import { Router } from "express";
import { login, register, validateWhitelist } from "../services/authService.js";

export const authRoutes = Router();

authRoutes.get("/whitelist", async (request, response, next) => {
  try {
    const email = String(request.query.email ?? "");
    const record = await validateWhitelist(email);
    response.json({ found: Boolean(record), profile: record?.toJSON() ?? null });
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/login", async (request, response, next) => {
  try {
    const { email, password } = request.body as { email: string; password: string };
    response.json(await login(email, password));
  } catch (error) {
    next(error);
  }
});

authRoutes.post("/register", async (request, response, next) => {
  try {
    const { email, password } = request.body as { email: string; password: string };
    response.status(201).json(await register(email, password));
  } catch (error) {
    next(error);
  }
});
