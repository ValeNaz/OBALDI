"use client";
import React from 'react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
    conversations: any[];
    activeId?: string;
    onSelect: (id: string) => void;
    className?: string;
}

export default function ConversationList({ conversations, activeId, onSelect, className }: ConversationListProps) {
    return (
        <div className={cn("flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm", className)}>
            <div className="p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                <h2 className="font-bold text-[#0b224e]">Chat Recenti</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-2">
                            <span className="text-xl">💬</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Nessuna conversazione attiva</p>
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const lastMsg = conv.messages?.[0];
                        const time = lastMsg
                            ? new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(new Date(lastMsg.createdAt))
                            : '';

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv.id)}
                                className={cn(
                                    "w-full p-4 flex items-center gap-3 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 relative group",
                                    activeId === conv.id && "bg-[#0b224e]/5"
                                )}
                            >
                                {activeId === conv.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0b224e]" />}

                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0b224e]/10 to-[#0b224e]/5 flex items-center justify-center text-[#0b224e] font-bold shrink-0 border border-[#0b224e]/5 group-hover:scale-105 transition-transform">
                                    {conv.title?.[0]?.toUpperCase() || 'C'}
                                </div>

                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-semibold text-sm text-slate-900 truncate">
                                            {conv.type === 'VENDOR_REPORT' && <span className="text-amber-500 mr-1">⚠️</span>}
                                            {conv.title}
                                        </h3>
                                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                            {time}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate leading-tight">
                                        {lastMsg ? lastMsg.body : 'Nessun messaggio'}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
