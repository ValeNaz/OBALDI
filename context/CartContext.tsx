"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useUser } from "@/context/UserContext";

export type CartItem = {
  productId: string;
  title: string;
  priceCents: number;
  currency: string;
  image: string;
  qty: number;
  pointsEligible: boolean;
  pointsPrice: number | null;
  premiumOnly: boolean;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (item: CartItem) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const GUEST_KEY = "obaldi.cart.guest";

const readStorage = (key: string) => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

const mergeItems = (base: CartItem[], incoming: CartItem[]) => {
  const map = new Map<string, CartItem>();
  for (const item of base) {
    map.set(item.productId, { ...item });
  }
  for (const item of incoming) {
    const existing = map.get(item.productId);
    if (!existing) {
      map.set(item.productId, { ...item });
    } else {
      existing.qty += item.qty;
      map.set(item.productId, existing);
    }
  }
  return Array.from(map.values());
};

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [storageKey, setStorageKey] = useState(GUEST_KEY);

  useEffect(() => {
    setItems(readStorage(storageKey));
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // Ignore storage failures in private mode.
    }
  }, [items, hydrated, storageKey]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("order_success") === "1") {
      setItems([]);
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const nextKey = user?.id ? `obaldi.cart.${user.id}` : GUEST_KEY;
    if (nextKey === storageKey) return;

    const nextItems = readStorage(nextKey);
    if (user?.id) {
      const guestItems = readStorage(GUEST_KEY);
      if (guestItems.length > 0) {
        const merged = mergeItems(nextItems, guestItems);
        setItems(merged);
        try {
          window.localStorage.setItem(nextKey, JSON.stringify(merged));
          window.localStorage.removeItem(GUEST_KEY);
        } catch {
          // Ignore storage failures in private mode.
        }
      } else {
        setItems(nextItems);
      }
    } else {
      setItems(nextItems);
    }
    setStorageKey(nextKey);
  }, [hydrated, storageKey, user?.id]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.productId === item.productId);
      if (!existing) {
        return [...prev, { ...item, qty: Math.max(1, item.qty) }];
      }
      return prev.map((entry) =>
        entry.productId === item.productId
          ? { ...entry, qty: entry.qty + Math.max(1, item.qty) }
          : entry
      );
    });
  };

  const updateQty = (productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((entry) =>
          entry.productId === productId ? { ...entry, qty } : entry
        )
        .filter((entry) => entry.qty > 0)
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((entry) => entry.productId !== productId));
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.qty, 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, itemCount, addItem, updateQty, removeItem, clearCart }),
    [items, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
