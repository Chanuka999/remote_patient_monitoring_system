import express from "express";
import {
  Loginuser,
  registerUser,
  getMe,
  updateSymptoms,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", Loginuser);

// authenticated endpoints for current user
userRouter.get("/me", getMe);
userRouter.patch("/me/symptoms", updateSymptoms);

export default userRouter;
