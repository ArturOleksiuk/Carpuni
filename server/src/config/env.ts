import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/carpuni",
  jwtSecret: process.env.JWT_SECRET ?? "carpuni-dev-secret"
};
