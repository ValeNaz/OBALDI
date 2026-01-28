"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    FaChartLine,
    FaBoxOpen,
    FaList,
    FaExchangeAlt,
    FaHeadset,
    FaShoppingBag,
    FaHistory,
    FaNewspaper,
    FaUsers,
    FaSignOutAlt
} from "react-icons/fa";
import { useUI } from "@/context/UIContext";

const AdminSidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [counts, setCounts] = useState<Record<string, number>>({});
    const { showToast, confirm } = useUI();

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await fetch("/api/admin/notifications");
                if (res.ok) {
                    const data = await res.json();
                    setCounts(data.counts || {});
                }
            } catch (err) {
                console.error("Failed to fetch notification counts", err);
            }
        };
        fetchCounts();
        // Refresh every 2 minutes
        const interval = setInterval(fetchCounts, 120000);
        return () => clearInterval(interval);
    }, []);

    const isActive = (path: string) => {
        if (path === "/admin" && pathname === "/admin") return true;
        if (path !== "/admin" && pathname?.startsWith(path)) return true;
        return false;
    };

    const NavItem = ({ href, icon: Icon, label, badge }: { href: string; icon: any; label: string; badge?: number }) => (
        <Link
            href={href}
            className={`flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-xl font-bold transition whitespace-nowrap lg:whitespace-normal ${isActive(href)
                ? "bg-[#0b224e] text-white shadow-lg"
                : "hover:bg-white/60 text-slate-500"
                } ${isActive(href) ? "flex-[1.5] lg:flex-none" : "flex-1 lg:flex-none"}`}
        >
            <div className="flex items-center gap-2 lg:gap-3">
                <Icon size={18} className="shrink-0" />
                <span className="text-xs lg:text-sm">{label}</span>
            </div>
            {badge && badge > 0 ? (
                <span className="bg-red-500 text-white text-[9px] lg:text-[10px] w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full shadow-sm animate-pulse-soft shrink-0">
                    {badge > 99 ? "99+" : badge}
                </span>
            ) : null}
        </Link>
    );

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: "Logout",
            message: "Sei sicuro di voler uscire dalla console di amministrazione?",
            confirmText: "Esci",
            variant: "danger"
        });

        if (!confirmed) return;

        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) {
                showToast("Logout effettuato", "info");
                router.push("/admin/login");
            }
        } catch (err) {
            showToast("Errore durante il logout", "error");
        }
    };

    return (
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar glass-panel p-2 lg:p-3 sticky top-24 lg:top-32 z-30">
            <div className="flex lg:flex-col gap-1 min-w-max lg:min-w-0 w-full">
                <NavItem href="/admin" icon={FaChartLine} label="Dashboard" />
                <div className="hidden lg:block h-px bg-slate-100 my-2 mx-2" />
                <NavItem href="/admin/products" icon={FaBoxOpen} label="Prodotti" />
                <NavItem href="/admin/orders" icon={FaShoppingBag} label="Ordini" badge={counts.orders} />
                <NavItem href="/admin/assist" icon={FaHeadset} label="Assistenza" badge={counts.assist} />
                <NavItem href="/admin/changes" icon={FaExchangeAlt} label="Modifiche" badge={counts.changes} />
                <NavItem href="/admin/audit" icon={FaHistory} label="Audit Log" />
                <NavItem href="/admin/news" icon={FaNewspaper} label="News" />
                <NavItem href="/admin/users" icon={FaUsers} label="Utenti" />
                <div className="hidden lg:block h-px bg-slate-100 my-2 mx-2" />
                <button
                    onClick={handleLogout}
                    className="flex lg:w-full text-left p-3 rounded-xl font-bold items-center gap-3 transition text-red-500 hover:bg-red-50 shrink-0"
                >
                    <FaSignOutAlt size={18} />
                    <span className="lg:inline">Esci</span>
                </button>
            </div>
        </nav>
    );
};

export default AdminSidebar;
