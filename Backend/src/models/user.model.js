// src/models/user.model.js (UPDATED VERSION)
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    // *** NEW: Array of user IDs who are friends with this user ***
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    // *** NEW: Optional username for easier searching (can be added later) ***
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows null values but ensures uniqueness when set
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;