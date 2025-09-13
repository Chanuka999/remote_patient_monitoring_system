import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import User from "./model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

app.use(cors());

dotenv.config();

const PORT = 3000;

const connectDb = async () => {
  try {
    const MONGOURL = process.env.MONGOURL;
    await mongoose.connect(MONGOURL);
    console.log("mongodb connected successfully");
  } catch (error) {
    console.log("mongodb faild");
  }
};

app.post("/register", async (req, res) => {
  const { name, email, password, role, number } = req.body;
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      number,
    });
    await newUser.save();
    res.status(200).json({ success: true, data: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ success: false, message: "server error", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        "your_jwt_secret", // Replace with your secret or use process.env.JWT_SECRET
        { expiresIn: "1d" }
      );
      res.status(200).json({
        success: true,
        message: "success",
        token,
        user: {
          role: user.role,
          email: user.email,
          name: user.name,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "password incorrect" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "server error" });
  }
});

app.listen(PORT, () => {
  connectDb();
  console.log(`server is starting on ${PORT}`);
});
