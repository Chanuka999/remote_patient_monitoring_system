import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import userRouter from "./routes/userRouter.js";
import healthRouter from "./routes/healthRouter.js";
import predictRouter from "./routes/predictRouter.js";
import measurementRouter from "./routes/measurementRouter.js";
import hypertensionRouter from "./routes/hypertensionRouter.js";

import { connectDb } from "./lib/db.js";
import { ML_HOST, ML_PORT } from "./lib/utils.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = Number(process.env.PORT) || 3000;

// Log chat API config status (kept for compatibility with existing code)
const _chatApiConfigured = Boolean(
  process.env.API_CHAT_URL ||
    process.env.VITE_API_URL ||
    process.env.API_CHAT_KEY ||
    process.env.CHAT_API_KEY
);
console.log(
  "chat API configured on server:",
  _chatApiConfigured
    ? "yes"
    : "no (set API_CHAT_URL or API_CHAT_KEY in server env)"
);

// Mount routers under /api for a clean structure
app.use("/api", healthRouter);
app.use("/api", predictRouter);
app.use("/api", measurementRouter);
app.use("/api", hypertensionRouter);

// User routes (register/login) are mounted at root in current client expectations
app.use("/", userRouter);

// Startup: attempt DB connect first, then start listening
(async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`server is starting on ${PORT}`);
    if (mongoose.connection.readyState !== 1) {
      console.warn(
        "Server started but DB is not connected. Registrations will fail until DB is available."
      );
    }
    console.log(`ML_HOST=${ML_HOST} ML_PORT=${ML_PORT}`);
  });
})();

export default app;
