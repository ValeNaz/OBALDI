"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaChartLine,
    FaBoxOpen,
    FaList,
    FaExchangeAlt,
    FaHeadset,
    FaShoppingBag,
    FaHistory,
    FaNewspaper,
    FaUsers
} from "react-icons/fa";

const AdminSidebar = () => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/admin" && pathname === "/admin") return true;
        if (path !== "/admin" && pathname?.startsWith(path)) return true;
        return false;
    };

    const NavItem = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
        <Link
            href={href}
            className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-3 transition ${isActive(href)
                ? "bg-[#0b224e] text-white shadow-lg"
                : "hover:bg-white/60 text-slate-500"
                }`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </Link>
    );

    return (
        <nav className="space-y-2 glass-panel p-4">
            <NavItem href="/admin" icon={FaChartLine} label="Dashboard" />
            <div className="h-px bg-slate-200 my-2" />
            <NavItem href="/admin/products" icon={FaBoxOpen} label="Prodotti" />
            <NavItem href="/admin/orders" icon={FaShoppingBag} label="Ordini" />
            <NavItem href="/admin/assist" icon={FaHeadset} label="Assistenza" />
            <NavItem href="/admin/changes" icon={FaExchangeAlt} label="Modifiche" />
            <NavItem href="/admin/audit" icon={FaHistory} label="Audit Log" />
            <NavItem href="/admin/news" icon={FaNewspaper} label="News" />
            <NavItem href="/admin/users" icon={FaUsers} label="Utenti" />
        </nav>
    );
};

export default AdminSidebar;
