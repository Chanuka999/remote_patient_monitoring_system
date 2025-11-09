import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import userRouter from "./routes/userRouter.js";
import healthRouter from "./routes/healthRouter.js";
import predictRouter from "./routes/predictRouter.js";
import measurementRouter from "./routes/measurementRouter.js";
import hypertensionRouter from "./routes/hypertensionRouter.js";
import alertRouter from "./routes/alertRouter.js";

import { connectDb } from "./lib/db.js";
import { ML_HOST, ML_PORT } from "./lib/utils.js";
import http from "http";
import { Server as IOServer } from "socket.io";
import { setIo } from "./lib/socket.js";

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
app.use("/api", alertRouter);

// User routes (register/login) are mounted at root in current client expectations
app.use("/", userRouter);

// Startup: attempt DB connect first, then start listening
const start = async () => {
  await connectDb();

  // create http server and attach socket.io
  const server = http.createServer(app);
  const io = new IOServer(server, {
    cors: {
      origin: process.env.VITE_FRONTEND_ORIGIN || true,
      methods: ["GET", "POST"],
    },
  });
  // basic join handler for doctors to join their room by id
  io.on("connection", (socket) => {
    socket.on("join", (data) => {
      try {
        const doctorId = data?.doctorId || data?.id;
        if (doctorId) socket.join(String(doctorId));
      } catch (err) {
        // ignore
      }
    });
  });
  // expose io to controllers
  setIo(io);

  server.listen(PORT, () => {
    console.log(`server is starting on ${PORT}`);
    if (mongoose.connection.readyState !== 1) {
      console.warn(
        "Server started but DB is not connected. Registrations will fail until DB is available."
      );
    }
    console.log(`ML_HOST=${ML_HOST} ML_PORT=${ML_PORT}`);
  });
};

start();

export default app;
