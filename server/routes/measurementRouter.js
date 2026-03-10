import express from "express";
import {
  getHealthTrends,
  saveMeasurement,
} from "../controllers/measurementController.js";

const router = express.Router();

router.post("/measurements", saveMeasurement);
router.get("/measurements/trends", getHealthTrends);

export default router;
