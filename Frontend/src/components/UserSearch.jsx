// src/components/UserSearch.jsx (NEW COMPONENT)
import { useState } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { Search, UserPlus, Users, Clock, Check } from "lucide-react";

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    searchResults,
    isSearchingUsers,
    isSendingRequest,
    searchUsers,
    sendFriendRequest,
    clearSearchResults
  } = useFriendStore();

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      await searchUsers(query);
    } else {
      clearSearchResults();
    }
  };

  const getStatusButton = (user) => {
    const { relationshipStatus } = user;

    switch (relationshipStatus) {
      case 'friends':
        return (
          <span className="btn btn-success btn-sm gap-1 no-animation">
            <Check className="w-4 h-4" />
            Friends
          </span>
        );
      
      case 'request_sent':
        return (
          <span className="btn btn-warning btn-sm gap-1 no-animation">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
        
      case 'request_received':
        return (
          <span className="btn btn-info btn-sm gap-1 no-animation">
            <Clock className="w-4 h-4" />
            Sent you request
          </span>
        );
        
      default:
        return (
          <button
            onClick={() => sendFriendRequest(user._id)}
            disabled={isSendingRequest}
            className="btn btn-primary btn-sm gap-1"
          >
            {isSendingRequest ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            Add Friend
          </button>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* *** SEARCH HEADER *** */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Find Friends
        </h3>
        
        {/* *** SEARCH INPUT *** */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearch}
            className="input input-bordered w-full pl-10"
          />
          {isSearchingUsers && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 loading loading-spinner loading-sm"></span>
          )}
        </div>
      </div>

      {/* *** SEARCH RESULTS *** */}
      {searchQuery && (
        <div>
          {isSearchingUsers ? (
            <div className="flex items-center justify-center py-8">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
            <div className="text-center py-8 text-base-content/60">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No users found for "{searchQuery}"</p>
              <p className="text-sm mt-1">Try searching with a different name or email</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{user.fullName}</h4>
                      <p className="text-sm text-base-content/70">{user.email}</p>
                    </div>
                  </div>

                  {getStatusButton(user)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* *** SEARCH INSTRUCTIONS *** */}
      {!searchQuery && (
        <div className="text-center py-8 text-base-content/60">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Start typing to search for users</p>
          <p className="text-sm mt-1">Search by name or email address</p>
        </div>
      )}
    </div>
  );
};

export default UserSearch;