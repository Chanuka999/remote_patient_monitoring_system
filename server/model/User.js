import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
  name: {
    type: "String",
    required: true,
  },
  email: {
    type: "String",
    required: true,
  },
  password: {
    type: "String",
    required: true,
  },
  role: {
    type: "String",
    enum: ["patient", "doctor", "admin"],
    required: true,
  },
  number: {
    type: String,
  },
});

const UserModel = mongoose.model("Users", UserSchema);

export default UserModel;
