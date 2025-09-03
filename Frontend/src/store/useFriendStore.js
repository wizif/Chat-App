// src/store/useFriendStore.js (NEW FILE)
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useFriendStore = create((set, get) => ({
  // *** STATE ***
  friends: [],
  pendingRequests: [], // Requests received by current user
  sentRequests: [],    // Requests sent by current user
  searchResults: [],
  
  // *** LOADING STATES ***
  isLoadingFriends: false,
  isLoadingRequests: false,
  isSearchingUsers: false,
  isSendingRequest: false,

  // *** FRIEND MANAGEMENT ***
  getFriends: async () => {
    set({ isLoadingFriends: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ friends: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load friends");
    } finally {
      set({ isLoadingFriends: false });
    }
  },

  removeFriend: async (friendId) => {
    try {
      await axiosInstance.delete(`/friends/${friendId}`);
      set(state => ({
        friends: state.friends.filter(friend => friend._id !== friendId)
      }));
      toast.success("Friend removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove friend");
    }
  },

  // *** FRIEND REQUESTS ***
  getPendingRequests: async () => {
    set({ isLoadingRequests: true });
    try {
      const res = await axiosInstance.get("/friends/requests/pending");
      set({ pendingRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load requests");
    } finally {
      set({ isLoadingRequests: false });
    }
  },

  getSentRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests/sent");
      set({ sentRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load sent requests");
    }
  },

  sendFriendRequest: async (userId) => {
    set({ isSendingRequest: true });
    try {
      await axiosInstance.post(`/friends/request/${userId}`);
      
      // Update search results to reflect request sent
      set(state => ({
        searchResults: state.searchResults.map(user => 
          user._id === userId 
            ? { ...user, relationshipStatus: 'request_sent' }
            : user
        )
      }));
      
      // Refresh sent requests
      get().getSentRequests();
      
      toast.success("Friend request sent!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send friend request");
    } finally {
      set({ isSendingRequest: false });
    }
  },

  acceptFriendRequest: async (requestId) => {
    try {
      await axiosInstance.put(`/friends/request/${requestId}/accept`);
      
      // Remove from pending requests
      set(state => ({
        pendingRequests: state.pendingRequests.filter(req => req._id !== requestId)
      }));
      
      // Refresh friends list
      get().getFriends();
      
      toast.success("Friend request accepted!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to accept request");
    }
  },

  rejectFriendRequest: async (requestId) => {
    try {
      await axiosInstance.put(`/friends/request/${requestId}/reject`);
      
      // Remove from pending requests
      set(state => ({
        pendingRequests: state.pendingRequests.filter(req => req._id !== requestId)
      }));
      
      toast.success("Friend request rejected");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject request");
    }
  },

  // *** USER SEARCH ***
  searchUsers: async (query) => {
    if (!query || query.length < 2) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearchingUsers: true });
    try {
      const res = await axiosInstance.get(`/friends/search?query=${encodeURIComponent(query)}`);
      set({ searchResults: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Search failed");
      set({ searchResults: [] });
    } finally {
      set({ isSearchingUsers: false });
    }
  },

  clearSearchResults: () => {
    set({ searchResults: [] });
  },

  // *** INITIALIZE DATA ***
  initializeFriendData: async () => {
    await Promise.all([
      get().getFriends(),
      get().getPendingRequests(),
      get().getSentRequests()
    ]);
  }
}));