// src/models/message.model.js (UPDATED VERSION)
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    // *** NEW: Message reactions ***
    reactions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      emoji: {
        type: String,
        required: true,
        enum: ['👍', '❤️', '😂', '😮', '😢', '😡'] // Allowed reaction emojis
      }
    }]
  },
  { timestamps: true }
);

// *** Ensure a user can only react once per message with the same emoji ***
messageSchema.index({ _id: 1, "reactions.userId": 1, "reactions.emoji": 1 }, { unique: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;