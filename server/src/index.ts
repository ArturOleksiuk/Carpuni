import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { seedDatabase } from "./data/seed.js";

try {
  await connectDatabase();
  await seedDatabase();
} catch (error) {
  console.error("MongoDB connection failed. Start MongoDB or update MONGODB_URI in server/.env.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

app.listen(env.port, () => {
  console.log(`Carpuni API is running on http://localhost:${env.port}`);
});
