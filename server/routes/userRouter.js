import express from "express";
import { Loginuser, registerUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", Loginuser);

export default userRouter;
