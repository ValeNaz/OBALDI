"use client";

import { useEffect, useState } from "react";
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

export default function NotificationsPage() {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications ?? []);
                }
            } catch (error) {
                console.error("Failed to load notifications:", error);
            } finally {
                setLoading(false);
            }
        };
        loadNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: "POST" });
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch("/api/notifications/read-all", { method: "POST" });
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays === 0) {
            return "Oggi, " + date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
        } else if (diffDays === 1) {
            return "Ieri, " + date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
        } else if (diffDays < 7) {
            return `${diffDays} giorni fa`;
        } else {
            return date.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
        }
    };

    const filteredNotifications = filter === "unread"
        ? notifications.filter((n) => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    if (!user) {
        return (
            <div className="container-max page-pad pt-28 md:pt-32 pb-20">
                <div className="glass-panel p-8 text-center">
                    <p className="text-sm text-slate-600">Devi effettuare l'accesso.</p>
                    <Link href="/login" className="mt-4 inline-block text-sm font-bold text-[#0b224e]">
                        Vai al login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container-max page-pad pt-28 md:pt-32 pb-20">
            <div className="mb-10">
                <Link href="/profile" className="text-sm text-slate-500 hover:text-[#0b224e] mb-4 inline-block">
                    ← Torna al profilo
                </Link>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Notifiche</h1>
                        <p className="text-slate-500 mt-2">
                            {unreadCount > 0
                                ? `Hai ${unreadCount} notifich${unreadCount === 1 ? "a" : "e"} non lett${unreadCount === 1 ? "a" : "e"}`
                                : "Tutte le notifiche sono state lette"}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 text-sm font-bold text-[#0b224e] hover:bg-slate-100 rounded-full transition"
                        >
                            Segna tutte come lette
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === "all"
                        ? "bg-[#0b224e] text-white"
                        : "bg-white/70 text-slate-600 hover:bg-white"
                        }`}
                >
                    Tutte ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition ${filter === "unread"
                        ? "bg-[#0b224e] text-white"
                        : "bg-white/70 text-slate-600 hover:bg-white"
                        }`}
                >
                    Non lette ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="glass-panel p-8 text-center text-slate-500">Caricamento notifiche...</div>
            ) : filteredNotifications.length === 0 ? (
                <div className="glass-panel p-12 text-center">
                    <FaInbox className="text-6xl text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">
                        {filter === "unread" ? "Nessuna notifica non letta" : "Nessuna notifica"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`glass-card p-6 cursor-pointer transition-all hover:shadow-md ${!notification.isRead ? "border-l-4 border-l-[#0b224e] bg-blue-50/30" : ""
                                }`}
                            onClick={() => {
                                if (!notification.isRead) markAsRead(notification.id);
                                if (notification.link) window.location.href = notification.link;
                            }}
                        >
                            <div className="flex gap-4">
                                {(() => {
                                    const Icon = getIcon(notification.type);
                                    return <Icon className="text-3xl flex-shrink-0 text-[#0b224e]" />;
                                })()}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className={`font-bold ${!notification.isRead ? "text-[#0b224e]" : "text-slate-700"}`}>
                                                {notification.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                                        </div>
                                        {!notification.isRead && (
                                            <span className="w-3 h-3 bg-[#0b224e] rounded-full flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3">{formatDate(notification.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
