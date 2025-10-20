import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDb = async () => {
  try {
    let MONGOURL = process.env.MONGOURL;
    if (!MONGOURL) {
      MONGOURL = "mongodb://127.0.0.1:27017/rpms_dev";
      console.log("MONGOURL not set; attempting local fallback:", MONGOURL);
    }
    await mongoose.connect(MONGOURL, { serverSelectionTimeoutMS: 5000 });
    console.log("mongodb connected successfully");
  } catch (error) {
    console.error(
      "mongodb failed to connect",
      error && error.message ? error.message : error
    );
  }
};

export default connectDb;
