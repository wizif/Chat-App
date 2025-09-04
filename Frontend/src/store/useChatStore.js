// src/store/useChatStore.js (UPDATED VERSION)
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [], // *** This will now only contain friends ***
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // *** UPDATED: Now gets friends instead of all users ***
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      // *** Handle the case where user has no friends gracefully ***
      if (error.response?.status === 403 || error.response?.data?.error?.includes("friends")) {
        console.log("No friends found - this is normal for new users");
        set({ users: [] });
      } else {
        toast.error(error.response?.data?.message || "Failed to load contacts");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // *** UPDATED: Better error handling for non-friends ***
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Can only view messages with friends");
        // *** Reset selected user if not friends ***
        set({ selectedUser: null, messages: [] });
      } else {
        toast.error(error.response?.data?.message || "Failed to load messages");
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // *** UPDATED: Better error handling for non-friends ***
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Can only send messages to friends");
        // *** Reset selected user if not friends ***
        set({ selectedUser: null, messages: [] });
      } else {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // *** NEW: Clear selected user (useful when unfriending) ***
  clearSelectedUser: () => set({ selectedUser: null, messages: [] }),
}));