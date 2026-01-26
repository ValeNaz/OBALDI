"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { FaBell, FaBox, FaTruck, FaCheckCircle, FaStar, FaTimesCircle, FaCoins, FaGift, FaInbox } from "react-icons/fa";
import type { IconType } from "react-icons";

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
};

const NotificationBell = () => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications ?? []);
                setUnreadCount(data.unreadCount ?? 0);
            }
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "POST" });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications/read-all", { method: "POST" });
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const getIcon = (type: string): IconType => {
        switch (type) {
            case "ORDER_CREATED":
            case "ORDER_PAID":
                return FaBox;
            case "ORDER_SHIPPED":
                return FaTruck;
            case "ORDER_DELIVERED":
                return FaCheckCircle;
            case "PRODUCT_APPROVED":
                return FaStar;
            case "PRODUCT_REJECTED":
                return FaTimesCircle;
            case "POINTS_EARNED":
                return FaCoins;
            case "MEMBERSHIP_RENEWED":
                return FaGift;
            default:
                return FaBell;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Adesso";
        if (diffMins < 60) return `${diffMins}m fa`;
        if (diffHours < 24) return `${diffHours}h fa`;
        if (diffDays < 7) return `${diffDays}g fa`;
        return date.toLocaleDateString("it-IT");
    };

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/70 hover:bg-white border border-slate-200/50 transition-all shadow-sm hover:shadow-md"
                aria-label="Notifiche"
            >
                <FaBell className="text-lg text-[#0b224e]" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] bg-[#a41f2e] text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100">
                        <h3 className="font-bold text-[#0b224e]">Notifiche</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-[#0b224e] hover:underline"
                            >
                                Segna tutte come lette
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <FaInbox className="text-4xl mx-auto mb-2" />
                                <p className="text-sm">Nessuna notifica</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!notification.isRead ? "bg-blue-50/50" : ""
                                        }`}
                                    onClick={() => {
                                        if (!notification.isRead) markAsRead(notification.id);
                                        if (notification.link) {
                                            setIsOpen(false);
                                            window.location.href = notification.link;
                                        }
                                    }}
                                >
                                    <div className="flex gap-3">
                                        {(() => {
                                            const Icon = getIcon(notification.type);
                                            return <Icon className="text-xl flex-shrink-0 text-[#0b224e]" />;
                                        })()}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm text-slate-800 truncate">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="w-2 h-2 bg-[#0b224e] rounded-full flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <Link
                        href="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="block p-3 text-center text-sm font-semibold text-[#0b224e] hover:bg-slate-50 border-t border-slate-100"
                    >
                        Vedi tutte le notifiche →
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
