// src/routes/message.route.js (UPDATED VERSION)
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, addReaction } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

// *** NEW: Add reaction to message ***
router.post("/:messageId/reaction", protectRoute, addReaction);

export default router;