import express from "express";
import { getHealth, getDbStatus } from "../controllers/healthController.js";

const router = express.Router();

router.get("/health", getHealth);
router.get("/dbstatus", getDbStatus);

export default router;
