"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, Role } from "../types";

interface UserContextType {
  user: User | null;
  points: number;
  login: (email: string, role: Role) => void;
  logout: () => void;
  addPoints: (amount: number) => void;
  buyMembership: (isPremium: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [points, setPoints] = useState(0);

  const login = (email: string, role: Role) => {
    setUser({
      id: "u-" + Math.random().toString(36).substr(2, 9),
      email,
      role,
      isMember: true,
      isPremium: role === "ADMIN"
    });
  };

  const logout = () => setUser(null);

  const addPoints = (amount: number) => setPoints((prev) => prev + amount);

  const buyMembership = (isPremium: boolean) => {
    setUser({
      id: "u-new",
      email: "utente@esempio.it",
      role: "USER",
      isMember: true,
      isPremium,
      membershipExpiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString()
    });
    if (isPremium) setPoints(10);
  };

  return (
    <UserContext.Provider value={{ user, points, login, logout, addPoints, buyMembership }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
