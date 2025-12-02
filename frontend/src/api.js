// Base URL Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL;

function extractErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  const err = payload.error ?? payload;

  if (typeof err === "string") return err;
  if (err?.formErrors?.length) return err.formErrors[0];

  if (err?.fieldErrors) {
    for (const [field, messages] of Object.entries(err.fieldErrors)) {
      if (messages?.length) return `${field}: ${messages[0]}`;
    }
  }

  return fallback;
}

// Register User
export async function registerUser(email, password, confirmPassword, name) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirmPassword, name }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Registration failed"));
  }

  return res.json();
}

// Login User
// Sends user credentials to the backend's /login endpoint.
// On success, backend responds with { token, user }.
// The token can be stored in localStorage for authenticated requests.
export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Login failed"));
  }

  return res.json();
}

// Get Current User Profile
export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to fetch user"));
  }

  return res.json();
}

// Update User Profile
export async function updateProfile(profileData) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(profileData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Profile update failed"));
  }

  return res.json();
}

// Get User by ID
export async function getUserById(userId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to fetch user"));
  }

  return res.json();
}

// Search/Get All Users
export async function getAllUsers(searchQuery = '') {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = searchQuery
    ? `${API_BASE}/api/users?q=${encodeURIComponent(searchQuery)}`
    : `${API_BASE}/api/users`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to fetch users"));
  }

  return res.json();
}

// Send Connection Request
export async function sendConnectionRequest(userId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/${userId}/connection-request`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to send connection request"));
  }

  return res.json();
}

// Get Connection Requests
export async function getConnectionRequests() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/me/connection-requests`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to fetch connection requests"));
  }

  return res.json();
}

// Accept Connection Request
export async function acceptConnectionRequest(fromUserId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/connection-requests/${fromUserId}/accept`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to accept connection request"));
  }

  return res.json();
}

// Reject Connection Request
export async function rejectConnectionRequest(fromUserId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/connection-requests/${fromUserId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to reject connection request"));
  }

  return res.json();
}

// Get Connections
export async function getConnections() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/me/connections`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to fetch connections"));
  }

  return res.json();
}

// Follow User (keeping existing functionality)
export async function followUser(userId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/${userId}/follow`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to follow user"));
  }

  return res.json();
}

// Unfollow User (keeping existing functionality)
export async function unfollowUser(userId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/users/${userId}/follow`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to unfollow user"));
  }

  return res.json();
}

// Create Post
export async function createPost(text) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to create post"));
  }

  return res.json();
}

// Search / Get All Posts
export async function getPosts(searchQuery = '') {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const url = searchQuery
    ? `${API_BASE}/api/posts?q=${encodeURIComponent(searchQuery)}`
    : `${API_BASE}/api/posts`;


  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to fetch posts"));
  }

  return res.json();
}

// Like/Unlike Post
export async function toggleLikePost(postId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to like/unlike post"));
  }

  return res.json();
}

// Add Comment to Post
export async function addComment(postId, text) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to add comment"));
  }

  return res.json();
}

// Delete Post
export async function deletePost(postId) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(extractErrorMessage(err, "Failed to delete post"));
  }

  return res.json();
}
