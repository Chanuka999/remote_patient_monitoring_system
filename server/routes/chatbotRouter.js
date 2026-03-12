import express from "express";
import { getChatbotTrainingData } from "../controllers/chatbotTrainingController.js";

const chatbotRouter = express.Router();

// Get chatbot training/knowledge base data
chatbotRouter.get("/training-data", getChatbotTrainingData);

export default chatbotRouter;
