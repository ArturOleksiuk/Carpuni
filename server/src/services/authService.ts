import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserModel, WhitelistRecordModel } from "../models/index.js";
import { AuthResult, IUser, UserRole } from "../types.js";

export async function validateWhitelist(email: string) {
  return WhitelistRecordModel.findOne({ email: email.toLowerCase(), isActive: true });
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (!password) {
    throw new Error("Пароль обов'язковий");
  }

  const record = await validateWhitelist(email);
  if (!record) {
    throw new Error("Email не знайдено у базі університету");
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("Користувача ще не зареєстровано");
  }

  const passwordMatches = await bcrypt.compare(password, String(user.get("passwordHash")));
  if (!passwordMatches) {
    throw new Error("Невірний пароль");
  }

  const safeUser = user.toJSON() as unknown as IUser;
  return {
    token: signToken(safeUser),
    user: safeUser
  };
}

export async function register(email: string, password: string): Promise<AuthResult> {
  if (password.length < 6) {
    throw new Error("Пароль має містити щонайменше 6 символів");
  }

  const existing = await UserModel.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error("Користувач із таким email вже існує");
  }

  const user = await createUserFromWhitelist(email, password);
  return {
    token: signToken(user),
    user
  };
}

export async function createUserFromWhitelist(email: string, password: string): Promise<IUser> {
  const record = await validateWhitelist(email);
  if (!record) {
    throw new Error("Email не знайдено у whitelist");
  }

  const username = email.split("@")[0];
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    email,
    username,
    displayName: String(record.get("displayName")),
    passwordHash,
    role: record.get("role"),
    faculty: String(record.get("faculty")),
    group: record.get("group"),
    followersCount: 0,
    followingCount: 0,
    isActive: true
  });

  return user.toJSON() as unknown as IUser;
}

export async function isAdmin(userId: string) {
  const user = await UserModel.findById(userId);
  return user?.role === UserRole.Admin;
}

function signToken(user: IUser) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: "7d" });
}
