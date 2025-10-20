import express from "express";
import {
  predict,
  predictHeartFromForm,
  chat,
} from "../controllers/predictController.js";

const router = express.Router();

router.post("/predict", predict);
router.post("/predict/heart_from_form", predictHeartFromForm);
router.post("/chat", chat);

export default router;
