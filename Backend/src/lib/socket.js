// src/lib/socket.js (UPDATED VERSION)
import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// *** Store online users with more detailed info ***
const userSocketMap = {}; // {userId: socketId}
const userStatusMap = {}; // *** NEW: {userId: {lastSeen, isTyping, typingTo}} ***

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    // *** NEW: Track user status ***
    userStatusMap[userId] = {
      lastSeen: new Date(),
      isTyping: false,
      typingTo: null
    };
  }

  // *** Send online users to all clients ***
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // *** NEW: Handle typing indicators ***
  socket.on("typing", ({ recipientId }) => {
    if (userId && recipientId) {
      userStatusMap[userId] = {
        ...userStatusMap[userId],
        isTyping: true,
        typingTo: recipientId
      };
      
      // Send typing indicator to the specific recipient
      const recipientSocketId = userSocketMap[recipientId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("userTyping", {
          userId,
          isTyping: true
        });
      }
    }
  });

  // *** NEW: Handle stop typing ***
  socket.on("stopTyping", ({ recipientId }) => {
    if (userId && recipientId) {
      userStatusMap[userId] = {
        ...userStatusMap[userId],
        isTyping: false,
        typingTo: null
      };
      
      // Send stop typing to the specific recipient
      const recipientSocketId = userSocketMap[recipientId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("userTyping", {
          userId,
          isTyping: false
        });
      }
    }
  });

  // *** NEW: Get user status (for last seen times) ***
  socket.on("getUserStatus", ({ targetUserId }) => {
    const isOnline = !!userSocketMap[targetUserId];
    const status = userStatusMap[targetUserId];
    
    socket.emit("userStatus", {
      userId: targetUserId,
      isOnline,
      lastSeen: status?.lastSeen || null,
      isTyping: status?.isTyping || false
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    
    if (userId) {
      // *** Update last seen time before removing ***
      if (userStatusMap[userId]) {
        userStatusMap[userId].lastSeen = new Date();
        userStatusMap[userId].isTyping = false;
        
        // *** If user was typing, notify the recipient they stopped ***
        if (userStatusMap[userId].typingTo) {
          const recipientSocketId = userSocketMap[userStatusMap[userId].typingTo];
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("userTyping", {
              userId,
              isTyping: false
            });
          }
        }
      }
      
      delete userSocketMap[userId];
      // *** Keep user status for last seen, but mark as offline ***
    }
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };