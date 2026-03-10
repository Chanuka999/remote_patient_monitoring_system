import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderType: {
      type: String,
      enum: ["patient", "doctor"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "read"],
      default: "sent",
    },
  },
  {
    timestamps: true,
  },
);

const MessageModel = mongoose.model("Message", MessageSchema);

export default MessageModel;
