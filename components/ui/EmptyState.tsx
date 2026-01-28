"use client";

import { ReactNode } from "react";
import { FaInbox } from "react-icons/fa";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 shadow-inner">
                {icon || <FaInbox size={24} />}
            </div>
            <h3 className="text-lg font-bold text-[#0b224e] mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-slate-400 max-w-xs mb-6 leading-relaxed">
                    {description}
                </p>
            )}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
