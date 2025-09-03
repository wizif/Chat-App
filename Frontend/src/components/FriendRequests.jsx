// src/components/FriendRequests.jsx (NEW COMPONENT)
import { useEffect } from "react";
import { useFriendStore } from "../store/useFriendStore";
import { Check, X, UserPlus } from "lucide-react";

const FriendRequests = () => {
  const {
    pendingRequests,
    sentRequests,
    isLoadingRequests,
    getPendingRequests,
    getSentRequests,
    acceptFriendRequest,
    rejectFriendRequest
  } = useFriendStore();

  useEffect(() => {
    getPendingRequests();
    getSentRequests();
  }, [getPendingRequests, getSentRequests]);

  if (isLoadingRequests) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* *** RECEIVED FRIEND REQUESTS *** */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Friend Requests
          {pendingRequests.length > 0 && (
            <span className="badge badge-primary badge-sm">{pendingRequests.length}</span>
          )}
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No friend requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between p-4 bg-base-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={request.requester.profilePic || "/avatar.png"}
                    alt={request.requester.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{request.requester.fullName}</h4>
                    <p className="text-sm text-base-content/70">{request.requester.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => acceptFriendRequest(request._id)}
                    className="btn btn-primary btn-sm gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request._id)}
                    className="btn btn-error btn-outline btn-sm gap-1"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* *** SENT FRIEND REQUESTS *** */}
      {sentRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Sent Requests ({sentRequests.length})
          </h3>
          <div className="space-y-3">
            {sentRequests.map((request) => (
              <div
                key={request._id}
                className="flex items-center justify-between p-4 bg-base-200 rounded-lg opacity-75"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={request.recipient.profilePic || "/avatar.png"}
                    alt={request.recipient.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{request.recipient.fullName}</h4>
                    <p className="text-sm text-base-content/70">{request.recipient.email}</p>
                  </div>
                </div>
                
                <span className="text-sm text-warning font-medium">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendRequests;