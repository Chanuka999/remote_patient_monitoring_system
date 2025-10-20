import express from "express";
import { saveMeasurement } from "../controllers/measurementController.js";

const router = express.Router();

router.post("/measurements", saveMeasurement);

export default router;
