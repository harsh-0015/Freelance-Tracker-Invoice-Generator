// src/components/AuthProvider.js
"use client";

import React, { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export const AuthContext = createContext({ user: null, loading: true });

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // optional: attach token for backend calls
        const token = await u.getIdToken();
        localStorage.setItem("idToken", token);
        setUser(u);
      } else {
        localStorage.removeItem("idToken");
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
