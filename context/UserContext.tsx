"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Role } from "../types";

interface UserContextType {
  user: User | null;
  points: number;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const applyUserPayload = (payload: {
    user: { id: string; email: string; role: Role };
    membership: {
      status: string;
      planCode: string;
      currentPeriodEnd: string;
    } | null;
    pointsBalance: number;
  }) => {
    const isActive = payload.membership?.status === "ACTIVE";
    const isPremium = isActive && payload.membership?.planCode === "TUTELA";

    setUser({
      id: payload.user.id,
      email: payload.user.email,
      role: payload.user.role,
      isMember: Boolean(isActive),
      isPremium,
      membershipExpiresAt: payload.membership?.currentPeriodEnd
    });
    setPoints(payload.pointsBalance ?? 0);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/me", {
        cache: "no-store",
        credentials: "include"
      });
      if (!response.ok) {
        setUser(null);
        setPoints(0);
        return;
      }
      const payload = await response.json();
      applyUserPayload(payload);
    } catch {
      setUser(null);
      setPoints(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        return {
          ok: false,
          error: error?.error?.message ?? "Accesso non riuscito."
        };
      }
      await refresh();
      return { ok: true };
    } catch {
      return { ok: false, error: "Accesso non riuscito." };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setPoints(0);
    }
  };

  return (
    <UserContext.Provider value={{ user, points, loading, login, logout, refresh }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
