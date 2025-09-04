// src/components/FriendNotificationBadge.jsx (NEW COMPONENT - Optional Enhancement)
import { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { useAuthStore } from "../store/useAuthStore";

const FriendNotificationBadge = ({ children, className = "" }) => {
  const { pendingRequests, getPendingRequests } = useFriendStore();
  const { authUser } = useAuthStore();

  useEffect(() => {
    if (authUser) {
      // *** Refresh pending requests every 30 seconds ***
      const interval = setInterval(() => {
        getPendingRequests();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [authUser, getPendingRequests]);

  return (
    <div className={`relative ${className}`}>
      {children}
      {pendingRequests.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
          {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
        </span>
      )}
    </div>
  );
};

export default FriendNotificationBadge;