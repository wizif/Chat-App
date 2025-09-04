// src/store/useChatStore.js (ENHANCED VERSION)
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [], // This will now only contain friends
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  
  // *** NEW: Typing indicators state ***
  typingUsers: new Set(), // Set of user IDs who are currently typing
  isTyping: false, // Whether current user is typing
  typingTimeout: null, // Timeout for typing indicator

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
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

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Can only view messages with friends");
        set({ selectedUser: null, messages: [] });
      } else {
        toast.error(error.response?.data?.message || "Failed to load messages");
      }
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("Can only send messages to friends");
        set({ selectedUser: null, messages: [] });
      } else {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    }
  },

  // *** NEW: Add reaction to message ***
// *** FIXED: Add reaction to message ***
  addReaction: async (messageId, emoji) => {
    try {
      console.log('Making POST request to:', `/messages/${messageId}/reaction`);
      // FIXED: Send 'reaction' field to match controller expectation
      const res = await axiosInstance.post(`/messages/${messageId}/reaction`, { reaction: emoji });
      
      // Update local messages with new reactions
      set(state => ({
        messages: state.messages.map(msg => 
          msg._id === messageId 
            ? { ...msg, reactions: res.data.reactions }
            : msg
        )
      }));
    } catch (error) {
      console.log('Error from addReaction:', error.response?.data);
      toast.error(error.response?.data?.error || "Failed to add reaction");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // *** EXISTING: Listen for new messages ***
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // *** NEW: Listen for message reactions ***
    socket.on("messageReaction", ({ messageId, reactions, updatedBy }) => {
      set(state => ({
        messages: state.messages.map(msg => 
          msg._id === messageId 
            ? { ...msg, reactions: reactions }
            : msg
        )
      }));
    });

    // *** NEW: Listen for typing indicators ***
    socket.on("userTyping", ({ userId, isTyping }) => {
      if (userId === selectedUser._id) {
        set(state => {
          const newTypingUsers = new Set(state.typingUsers);
          if (isTyping) {
            newTypingUsers.add(userId);
          } else {
            newTypingUsers.delete(userId);
          }
          return { typingUsers: newTypingUsers };
        });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageReaction");
    socket.off("userTyping");
  },

  setSelectedUser: (selectedUser) => {
    // Clear typing indicators when switching users
    set({ 
      selectedUser, 
      typingUsers: new Set(),
      isTyping: false 
    });
    
    // Clear any existing typing timeout
    const { typingTimeout } = get();
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  },

  clearSelectedUser: () => set({ 
    selectedUser: null, 
    messages: [],
    typingUsers: new Set(),
    isTyping: false
  }),

  // *** NEW: Typing indicator functions ***
  startTyping: () => {
    const { selectedUser, isTyping } = get();
    if (!selectedUser || isTyping) return;

    const socket = useAuthStore.getState().socket;
    socket.emit("typing", { recipientId: selectedUser._id });
    
    set({ isTyping: true });

    // Auto-stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      get().stopTyping();
    }, 3000);

    set({ typingTimeout: timeout });
  },

  stopTyping: () => {
    const { selectedUser, isTyping, typingTimeout } = get();
    if (!selectedUser || !isTyping) return;

    const socket = useAuthStore.getState().socket;
    socket.emit("stopTyping", { recipientId: selectedUser._id });
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    set({ 
      isTyping: false,
      typingTimeout: null
    });
  },

  // *** NEW: Reset typing on message send ***
  resetTyping: () => {
    const { typingTimeout } = get();
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    set({ 
      isTyping: false,
      typingTimeout: null
    });
    
    // Don't emit stopTyping here as message sending will naturally stop typing
  }
}));