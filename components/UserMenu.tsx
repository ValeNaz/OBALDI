"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { FaUser, FaBox, FaCreditCard, FaCog, FaCoins, FaBuilding, FaDoorOpen } from "react-icons/fa";

const UserMenu = () => {
    const { user, logout } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
        router.push("/");
    };

    const getMenuIcon = (icon: string) => {
        switch (icon) {
            case "profile": return <FaUser className="text-lg" />;
            case "orders": return <FaBox className="text-lg" />;
            case "billing": return <FaCreditCard className="text-lg" />;
            case "settings": return <FaCog className="text-lg" />;
            case "dashboard": return <FaBuilding className="text-lg" />;
            default: return <FaUser className="text-lg" />;
        }
    };

    const menuItems = [
        { label: "Il mio profilo", href: "/profile", icon: "profile" },
        { label: "I miei ordini", href: "/orders", icon: "orders" },
        { label: "Fatturazione", href: "/billing", icon: "billing" },
        { label: "Impostazioni", href: "/settings", icon: "settings" },
    ];

    // Add admin/seller link if applicable
    if (user.role === "ADMIN" || user.role === "SELLER") {
        menuItems.push({
            label: user.role === "ADMIN" ? "Dashboard Admin" : "Dashboard Venditore",
            href: user.role === "ADMIN" ? "/admin" : "/seller",
            icon: "dashboard",
        });
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/70 hover:bg-white border border-slate-200/50 transition-all shadow-sm hover:shadow-md"
                aria-label="Menu utente"
            >
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <FaUser className="text-lg text-[#0b224e]" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-r from-[#0b224e] to-[#1a3a6e] text-white">
                        <p className="font-bold truncate">{user.firstName || user.email}</p>
                        <p className="text-sm text-white/70 truncate">{user.email}</p>
                        {user.isPremium && (
                            <div className="mt-2 inline-flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full text-xs font-bold text-amber-200">
                                <FaCoins className="text-xs" /> Membro Premium
                            </div>
                        )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                {getMenuIcon(item.icon)}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 py-2">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <FaDoorOpen className="text-lg" />
                            <span className="font-medium">Esci</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
