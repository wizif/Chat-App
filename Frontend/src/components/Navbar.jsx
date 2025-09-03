// src/components/Navbar.jsx (UPDATED VERSION)
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import { LogOut, MessageSquare, Settings, User, Users } from "lucide-react";
import { useEffect } from "react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { pendingRequests, getPendingRequests } = useFriendStore();

  // *** Get pending requests count for notification badge ***
  useEffect(() => {
    if (authUser) {
      getPendingRequests();
    }
  }, [authUser, getPendingRequests]);

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chatty</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* *** NEW: FRIENDS BUTTON WITH NOTIFICATION BADGE *** */}
            {authUser && (
              <Link
                to={"/friends"}
                className="btn btn-sm gap-2 transition-colors relative"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Friends</span>
                {/* *** NOTIFICATION BADGE FOR PENDING REQUESTS *** */}
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {pendingRequests.length > 9 ? '9+' : pendingRequests.length}
                  </span>
                )}
              </Link>
            )}

            <Link
              to={"/settings"}
              className="btn btn-sm gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to={"/profile"} className="btn btn-sm gap-2">
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;