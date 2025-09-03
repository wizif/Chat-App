// src/routes/friend.route.js (NEW FILE)
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  sendFriendRequest,
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriends,
  removeFriend,
  searchUsers
} from "../controllers/friend.controller.js";

const router = express.Router();

// *** FRIEND REQUEST ROUTES ***
router.post("/request/:userId", protectRoute, sendFriendRequest);           // Send friend request
router.get("/requests/pending", protectRoute, getPendingRequests);         // Get received requests
router.get("/requests/sent", protectRoute, getSentRequests);              // Get sent requests
router.put("/request/:requestId/accept", protectRoute, acceptFriendRequest); // Accept request
router.put("/request/:requestId/reject", protectRoute, rejectFriendRequest); // Reject request

// *** FRIENDS MANAGEMENT ROUTES ***
router.get("/", protectRoute, getFriends);                                // Get all friends
router.delete("/:friendId", protectRoute, removeFriend);                  // Remove friend

// *** USER SEARCH ROUTE ***
router.get("/search", protectRoute, searchUsers);                         // Search for users

export default router;