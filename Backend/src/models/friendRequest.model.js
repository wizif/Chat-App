// src/models/friendRequest.model.js
import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    // Who sent the friend request
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Who received the friend request  
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },
    // Status of the request: 'pending', 'accepted', 'rejected'
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

// Ensure a user cannot send multiple requests to the same person
friendRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;