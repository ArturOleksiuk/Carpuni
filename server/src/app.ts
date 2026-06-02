import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { adminRoutes } from "./routes/adminRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { commentRoutes } from "./routes/commentRoutes.js";
import { eventRoutes } from "./routes/eventRoutes.js";
import { messageRoutes } from "./routes/messageRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";
import { postRoutes } from "./routes/postRoutes.js";
import { scheduleRoutes } from "./routes/scheduleRoutes.js";
import { socialRoutes } from "./routes/socialRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.use(
  cors({
    origin: env.clientOrigin
  })
);
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", app: "Carpuni API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use(errorHandler);
