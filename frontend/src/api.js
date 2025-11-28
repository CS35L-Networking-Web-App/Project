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
export async function registerUser(email, password, confirmPassword) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirmPassword }),
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
