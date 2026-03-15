import express from "express";
import {
  getAdminOverview,
  getAdminUsers,
  updateUserRoleByAdmin,
  getAdminAppointments,
  getAdminAlerts,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/admin/overview", getAdminOverview);
router.get("/admin/users", getAdminUsers);
router.patch("/admin/users/:userId/role", updateUserRoleByAdmin);
router.get("/admin/appointments", getAdminAppointments);
router.get("/admin/alerts", getAdminAlerts);

export default router;
