import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();
const TOKEN_KEY = 'ultraboyz-token';
const API_URL = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Something went wrong.');
  }

  return data;
}

export async function uploadFile(file) {
  const token = localStorage.getItem(TOKEN_KEY);
  const formData = new FormData();

  formData.append('photo', file);

  const res = await fetch(`${API_URL}/api/uploads`, {
    method: 'POST',
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    // Do not set Content-Type manually.
    // The browser sets multipart/form-data with the correct boundary.
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Upload failed.');
  }

  return data.url;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch('/api/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function login(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);

    return data.user;
  }

  async function register(payload) {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);

    return data.user;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  function updateLocalUser(patch) {
    setUser((u) => ({
      ...u,
      ...patch,
    }));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
