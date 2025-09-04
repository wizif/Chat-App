// src/lib/utils.js (ENHANCED VERSION)

// *** ENHANCED: Better message time formatting ***
export function formatMessageTime(date) {
  const messageDate = new Date(date);
  const now = new Date();
  const diffInMilliseconds = now - messageDate;
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  // Same day - show time
  if (diffInDays === 0) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  
  // Yesterday
  if (diffInDays === 1) {
    return "Yesterday " + messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  
  // Within last week - show day name
  if (diffInDays < 7) {
    return messageDate.toLocaleDateString("en-US", {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  
  // Older - show date
  return messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// *** NEW: Format relative time for user status ***
export function formatRelativeTime(date) {
  if (!date) return "Unknown";
  
  const now = new Date();
  const pastDate = new Date(date);
  const diffInMilliseconds = now - pastDate;
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return pastDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

// *** NEW: Check if two dates are the same day ***
export function isSameDay(date1, date2) {
  return date1.toDateString() === date2.toDateString();
}

// *** NEW: Format date for message grouping ***
export function formatDateHeader(date) {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(messageDate, today)) {
    return "Today";
  } else if (isSameDay(messageDate, yesterday)) {
    return "Yesterday";
  } else {
    return messageDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
}