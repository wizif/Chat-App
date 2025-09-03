// src/controllers/friend.controller.js (NEW FILE)
import User from "../models/user.model.js";
import FriendRequest from "../models/friendRequest.model.js";

// *** SEND FRIEND REQUEST ***
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params; // User to send request to
    const requesterId = req.user._id; // Current logged-in user

    // Check if trying to send request to self
    if (userId === requesterId.toString()) {
      return res.status(400).json({ error: "Cannot send friend request to yourself" });
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if they're already friends
    const currentUser = await User.findById(requesterId);
    if (currentUser.friends.includes(userId)) {
      return res.status(400).json({ error: "Already friends with this user" });
    }

    // Check if friend request already exists (either direction)
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { requester: requesterId, recipient: userId },
        { requester: userId, recipient: requesterId }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Friend request already exists" });
    }

    // Create new friend request
    const friendRequest = new FriendRequest({
      requester: requesterId,
      recipient: userId
    });

    await friendRequest.save();
    
    res.status(201).json({ 
      message: "Friend request sent successfully",
      friendRequest 
    });

  } catch (error) {
    console.log("Error in sendFriendRequest controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *** GET PENDING FRIEND REQUESTS (RECEIVED) ***
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const pendingRequests = await FriendRequest.find({
      recipient: userId,
      status: 'pending'
    }).populate('requester', 'fullName email profilePic');

    res.status(200).json(pendingRequests);
  } catch (error) {
    console.log("Error in getPendingRequests controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *** GET SENT FRIEND REQUESTS ***
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const sentRequests = await FriendRequest.find({
      requester: userId,
      status: 'pending'
    }).populate('recipient', 'fullName email profilePic');

    res.status(200).json(sentRequests);
  } catch (error) {
    console.log("Error in getSentRequests controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *** ACCEPT FRIEND REQUEST ***
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Check if current user is the recipient
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to accept this request" });
    }

    // Check if request is still pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ error: "Friend request is no longer pending" });
    }

    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Add each user to the other's friends list
    await User.findByIdAndUpdate(userId, {
      $addToSet: { friends: friendRequest.requester }
    });

    await User.findByIdAndUpdate(friendRequest.requester, {
      $addToSet: { friends: userId }
    });

    res.status(200).json({ 
      message: "Friend request accepted successfully",
      friendRequest 
    });

  } catch (error) {
    console.log("Error in acceptFriendRequest controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *** REJECT FRIEND REQUEST ***
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);
    
    if (!friendRequest) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    // Check if current user is the recipient
    if (friendRequest.recipient.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to reject this request" });
    }

    // Update request status
    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.status(200).json({ 
      message: "Friend request rejected",
      friendRequest 
    });

  } catch (error) {
    console.log("Error in rejectFriendRequest controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *** GET ALL FRIENDS ***
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate('friends', 'fullName email profilePic');
    
    res.status(200).json(user.friends);
  } catch (error) {
    console.log("Error in getFriends controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *** REMOVE FRIEND (UNFRIEND) ***
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    // Remove friend from current user's friends list
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: friendId }
    });

    // Remove current user from friend's friends list
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: userId }
    });

    // Remove any existing friend requests between them
    await FriendRequest.deleteMany({
      $or: [
        { requester: userId, recipient: friendId },
        { requester: friendId, recipient: userId }
      ]
    });

    res.status(200).json({ message: "Friend removed successfully" });

  } catch (error) {
    console.log("Error in removeFriend controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// *** SEARCH USERS (FOR SENDING FRIEND REQUESTS) ***
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }

    // Search users by name or email (excluding current user)
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('fullName email profilePic').limit(10);

    // Get current user's friends and pending requests to show status
    const currentUser = await User.findById(currentUserId).select('friends');
    const pendingRequests = await FriendRequest.find({
      $or: [
        { requester: currentUserId, status: 'pending' },
        { recipient: currentUserId, status: 'pending' }
      ]
    });

    // Add relationship status to each user
    const usersWithStatus = users.map(user => {
      let status = 'none'; // No relationship
      
      // Check if already friends
      if (currentUser.friends.includes(user._id)) {
        status = 'friends';
      } else {
        // Check for pending requests
        const sentRequest = pendingRequests.find(req => 
          req.requester.toString() === currentUserId.toString() && 
          req.recipient.toString() === user._id.toString()
        );
        const receivedRequest = pendingRequests.find(req => 
          req.recipient.toString() === currentUserId.toString() && 
          req.requester.toString() === user._id.toString()
        );

        if (sentRequest) status = 'request_sent';
        if (receivedRequest) status = 'request_received';
      }

      return {
        ...user.toObject(),
        relationshipStatus: status
      };
    });

    res.status(200).json(usersWithStatus);

  } catch (error) {
    console.log("Error in searchUsers controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};