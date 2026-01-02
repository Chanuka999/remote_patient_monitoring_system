import express from "express";
import Alert from "../model/Alert.js";

const router = express.Router();

// GET /api/debug/alerts/:doctorId?limit=20
router.get("/alerts/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const limit = Math.min(100, Number(req.query.limit) || 20);
    if (!doctorId)
      return res
        .status(400)
        .json({ success: false, message: "doctorId required" });

    const alerts = await Alert.find({ doctorId: doctorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({ success: true, data: alerts });
  } catch (err) {
    console.error("/api/debug/alerts error", err);
    return res
      .status(500)
      .json({ success: false, message: "server error", error: String(err) });
  }
});

export default router;
