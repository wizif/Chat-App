// src/components/ChatHeader.jsx (ENHANCED VERSION)
import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useState, useEffect } from "react";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socket } = useAuthStore();
  const [userStatus, setUserStatus] = useState({
    isOnline: false,
    lastSeen: null,
    isTyping: false
  });

  // *** Check if user is online ***
  const isOnline = onlineUsers.includes(selectedUser._id);

  // *** Format last seen time ***
  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return "Last seen unknown";
    
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Last seen just now";
    if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `Last seen ${Math.floor(diffInMinutes / 1440)}d ago`;
    return `Last seen ${lastSeen.toLocaleDateString()}`;
  };

  // *** Get user status from socket ***
  useEffect(() => {
    if (socket && selectedUser) {
      socket.emit("getUserStatus", { targetUserId: selectedUser._id });
      
      socket.on("userStatus", (status) => {
        if (status.userId === selectedUser._id) {
          setUserStatus(status);
        }
      });

      return () => {
        socket.off("userStatus");
      };
    }
  }, [socket, selectedUser]);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* *** ENHANCED: Avatar with better online indicator *** */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img 
                src={selectedUser.profilePic || "/avatar.png"} 
                alt={selectedUser.fullName}
                className="object-cover"
              />
              {/* *** ENHANCED: Better online indicator *** */}
              {isOnline && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-base-100 animate-pulse"
                />
              )}
            </div>
          </div>

          {/* *** ENHANCED: User info with better status *** */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {isOnline ? (
                <span className="text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online
                </span>
              ) : (
                <span className="text-base-content/50">
                  {formatLastSeen(userStatus.lastSeen)}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* *** ENHANCED: Close button with hover effect *** */}
        <button 
          onClick={() => setSelectedUser(null)}
          className="btn btn-ghost btn-circle btn-sm hover:bg-base-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;