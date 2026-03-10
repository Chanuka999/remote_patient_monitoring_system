import express from "express";
import { getNearbyHospitals } from "../controllers/hospitalController.js";

const router = express.Router();

// GET /api/hospitals/nearby?lat=..&lng=..&radius=7000
router.get("/hospitals/nearby", getNearbyHospitals);

export default router;
