import express from "express";
import {
  uploadReport,
  getMyReports,
  getPatientReports,
  deleteReport,
  upload,
} from "../controllers/reportController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadReport);
router.get("/my-reports", getMyReports);
router.get("/patient/:patientId", getPatientReports);
router.delete("/:id", deleteReport);

export default router;
