import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    required: true,
  },
  number: {
    type: String,
  },
});

// Use singular 'User' model name (collection will be 'users')
const UserModel = mongoose.model("User", UserSchema);

export default UserModel;
