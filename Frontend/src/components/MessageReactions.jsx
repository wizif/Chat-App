// src/components/MessageReactions.jsx (FIXED VERSION)
import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Plus } from "lucide-react";

const MessageReactions = ({ message }) => {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const { addReaction } = useChatStore();
  const { authUser } = useAuthStore();

  const reactions = message.reactions || [];
  // FIXED: Use actual emojis that match your backend model
  const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Group reactions by emoji and count them
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = {
        count: 0,
        users: [],
        hasCurrentUser: false
      };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.userId);
    if (reaction.userId === authUser._id) {
      acc[reaction.emoji].hasCurrentUser = true;
    }
    return acc;
  }, {});

  const handleReaction = async (emoji) => {
    await addReaction(message._id, emoji);
    setShowReactionPicker(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {/* *** EXISTING REACTIONS *** */}
      {Object.entries(groupedReactions).map(([emoji, data]) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs
            transition-colors border
            ${data.hasCurrentUser 
              ? 'bg-primary/20 border-primary/30 text-primary' 
              : 'bg-base-200 border-base-300 hover:bg-base-300'
            }
          `}
        >
          <span>{emoji}</span>
          <span className="font-medium">{data.count}</span>
        </button>
      ))}

      {/* *** ADD REACTION BUTTON *** */}
      <div className="relative">
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="
            flex items-center justify-center w-6 h-6 rounded-full
            bg-base-200 hover:bg-base-300 transition-colors
            text-base-content/50 hover:text-base-content
          "
        >
          <Plus className="w-3 h-3" />
        </button>

        {/* *** REACTION PICKER DROPDOWN *** */}
        {showReactionPicker && (
          <div className="absolute bottom-full mb-2 left-0 z-10">
            <div className="bg-base-100 border border-base-300 rounded-lg p-2 shadow-lg">
              <div className="flex gap-1">
                {availableEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="
                      flex items-center justify-center w-8 h-8 rounded
                      hover:bg-base-200 transition-colors text-lg
                    "
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* *** CLICK OUTSIDE TO CLOSE *** */}
      {showReactionPicker && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowReactionPicker(false)}
        />
      )}
    </div>
  );
};

export default MessageReactions;