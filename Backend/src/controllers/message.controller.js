// src/controllers/message.controller.js (UPDATED VERSION)
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// *** UPDATED: Only return friends, not all users ***
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Get current user with populated friends
    const currentUser = await User.findById(loggedInUserId)
      .populate('friends', 'fullName email profilePic')
      .select('friends');

    // Return only friends (no password field needed since we're populating specific fields)
    res.status(200).json(currentUser.friends || []);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *** UPDATED: Check friendship before allowing to get messages ***
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Check if users are friends before allowing message access
    const currentUser = await User.findById(myId);
    if (!currentUser.friends.includes(userToChatId)) {
      return res.status(403).json({ error: "Can only view messages with friends" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *** UPDATED: Check friendship before allowing to send messages ***
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check if users are friends before allowing message sending
    const currentUser = await User.findById(senderId);
    if (!currentUser.friends.includes(receiverId)) {
      return res.status(403).json({ error: "Can only send messages to friends" });
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};