"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FaChartLine,
    FaBoxOpen,
    FaHeadset
} from "react-icons/fa";

const SellerSidebar = () => {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/seller" && pathname === "/seller") return true;
        if (path !== "/seller" && pathname?.startsWith(path)) return true;
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
            <NavItem href="/seller" icon={FaChartLine} label="Dashboard" />
            <div className="h-px bg-slate-200 my-2" />
            <NavItem href="/seller/products" icon={FaBoxOpen} label="I Miei Prodotti" />
            <NavItem href="/seller/support" icon={FaHeadset} label="Supporto" />
        </nav>
    );
};

export default SellerSidebar;
