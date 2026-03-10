import MessageModel from "../model/Message.js";
import UserModel from "../model/User.js";

// Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const doctors = await UserModel.find({ role: "doctor" }).select(
      "name email number",
    );
    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all patients
export const getPatients = async (req, res) => {
  try {
    const patients = await UserModel.find({ role: "patient" }).select(
      "name email number",
    );
    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get conversations for a patient
export const getConversations = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Group messages by doctorId
    const conversations = await MessageModel.aggregate([
      {
        $match: {
          patientId: new (require("mongoose").Types.ObjectId)(patientId),
        },
      },
      {
        $group: {
          _id: "$doctorId",
          lastMessage: { $last: "$message" },
          lastTimestamp: { $last: "$createdAt" },
          unreadCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "sent"] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { lastTimestamp: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctorInfo",
        },
      },
      {
        $unwind: "$doctorInfo",
      },
      {
        $project: {
          doctorId: "$_id",
          doctorName: "$doctorInfo.name",
          doctorEmail: "$doctorInfo.email",
          doctorNumber: "$doctorInfo.number",
          lastMessage: 1,
          lastTimestamp: 1,
          unreadCount: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get messages between patient and doctor
export const getMessages = async (req, res) => {
  try {
    const { patientId, doctorId } = req.params;

    const messages = await MessageModel.find({
      $or: [
        {
          patientId: patientId,
          doctorId: doctorId,
        },
      ],
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await MessageModel.updateMany(
      {
        doctorId: patientId,
        patientId: doctorId,
        status: "sent",
      },
      { status: "read" },
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { patientId, doctorId, message, senderType } = req.body;

    if (!patientId || !doctorId || !message || !senderType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const newMessage = new MessageModel({
      patientId,
      doctorId,
      message,
      senderType,
      status: "sent",
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
