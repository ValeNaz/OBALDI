import React from 'react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
    message: {
        id: string;
        body: string;
        createdAt: string;
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            role: string;
        };
    };
    isMe: boolean;
}

export default function MessageBubble({ message, isMe }: MessageBubbleProps) {
    const time = new Intl.DateTimeFormat('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(message.createdAt));

    return (
        <div className={cn(
            "flex w-full mb-3 animate-in fade-in slide-in-from-bottom-1",
            isMe ? "justify-end" : "justify-start"
        )}>
            <div className={cn(
                "max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm relative",
                isMe
                    ? "bg-[#0b224e] text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
            )}>
                {!isMe && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                        {message.sender.firstName} {message.sender.lastName}
                    </p>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.body}</p>
                <p className={cn(
                    "text-[9px] mt-1 text-right leading-none",
                    isMe ? "text-slate-300" : "text-slate-400"
                )}>
                    {time}
                </p>
            </div>
        </div>
    );
}
