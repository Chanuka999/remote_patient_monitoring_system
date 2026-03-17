import multer from "multer";
import path from "path";
import fs from "fs";
import Report from "../model/Report.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// Ensure uploads directory exists
const uploadDir = "uploads/reports";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and images are allowed."));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const verifyTokenFromReq = (req) => {
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth) return null;
  const token = auth.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

export const uploadReport = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";

    const report = new Report({
      title,
      description,
      fileUrl: `/uploads/reports/${req.file.filename}`,
      fileType,
      patientId: payload.id,
      uploadedBy: payload.id,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      data: report,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const reports = await Report.find({ patientId: payload.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPatientReports = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload?.id || (payload.role !== "doctor" && payload.role !== "admin")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { patientId } = req.params;
    const reports = await Report.find({ patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const payload = verifyTokenFromReq(req);
    if (!payload?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.params;
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Only patient who uploaded or admin can delete
    if (String(report.patientId) !== payload.id && payload.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Delete local file
    const filePath = path.join(process.cwd(), report.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Report.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
