// src/pages/FriendsPage.jsx (NEW PAGE)
import { useState, useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import FriendRequests from "../components/FriendRequests";
import UserSearch from "../components/UserSearch";
import { Users, UserPlus, Search, Trash2 } from "lucide-react";

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState("friends"); // 'friends', 'requests', 'search'
  
  const { 
    friends, 
    pendingRequests, 
    isLoadingFriends, 
    initializeFriendData, 
    removeFriend 
  } = useFriendStore();

  useEffect(() => {
    initializeFriendData();
  }, [initializeFriendData]);

  const tabs = [
    {
      id: "friends",
      label: "My Friends",
      icon: Users,
      count: friends.length
    },
    {
      id: "requests", 
      label: "Requests",
      icon: UserPlus,
      count: pendingRequests.length
    },
    {
      id: "search",
      label: "Find Friends",
      icon: Search,
      count: null
    }
  ];

  const handleRemoveFriend = async (friendId, friendName) => {
    if (window.confirm(`Remove ${friendName} from your friends?`)) {
      await removeFriend(friendId);
    }
  };

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-4xl">
      <div className="space-y-6">
        {/* *** PAGE HEADER *** */}
        <div>
          <h1 className="text-2xl font-bold mb-2">Friends</h1>
          <p className="text-base-content/70">Manage your friends and friend requests</p>
        </div>

        {/* *** TABS *** */}
        <div className="tabs tabs-bordered">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab tab-bordered gap-2 ${
                activeTab === tab.id ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="badge badge-primary badge-sm">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* *** TAB CONTENT *** */}
        <div className="bg-base-100 rounded-lg border border-base-300 p-6 min-h-[400px]">
          {/* *** FRIENDS LIST TAB *** */}
          {activeTab === "friends" && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Friends ({friends.length})
              </h3>

              {isLoadingFriends ? (
                <div className="flex items-center justify-center py-8">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium mb-2">No friends yet</h4>
                  <p className="mb-4">Start by sending friend requests to people you know!</p>
                  <button
                    onClick={() => setActiveTab("search")}
                    className="btn btn-primary gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Find Friends
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={friend.profilePic || "/avatar.png"}
                          alt={friend.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-medium">{friend.fullName}</h4>
                          <p className="text-sm text-base-content/70">{friend.email}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemoveFriend(friend._id, friend.fullName)}
                          className="btn btn-error btn-outline btn-sm gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* *** FRIEND REQUESTS TAB *** */}
          {activeTab === "requests" && <FriendRequests />}

          {/* *** SEARCH USERS TAB *** */}
          {activeTab === "search" && <UserSearch />}
        </div>
      </div>
    </div>
  );
};

export default FriendsPage;