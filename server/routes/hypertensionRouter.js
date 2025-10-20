import express from "express";
import { saveHypertension } from "../controllers/hypertensionController.js";

const router = express.Router();

router.post("/hypertension", saveHypertension);

export default router;
