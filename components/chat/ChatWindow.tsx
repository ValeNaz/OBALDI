"use client";
import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
    conversationId: string;
    initialMessages: any[];
    currentUser: any;
    title?: string;
    className?: string;
}

export default function ChatWindow({ conversationId, initialMessages, currentUser, title, className }: ChatWindowProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Update messages when conversationId changes
    useEffect(() => {
        setMessages(initialMessages);
    }, [conversationId, initialMessages]);

    useEffect(() => {
        // Scroll to bottom on mount and when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, conversationId]);

    useEffect(() => {
        // Setup SSE for real-time updates
        const eventSource = new EventSource('/api/sse/chat');

        eventSource.onmessage = (event) => {
            try {
                const { type, data } = JSON.parse(event.data);
                if (type === 'clear' && data.conversationId === conversationId) {
                    setMessages([]);
                }
                if (type === 'message' && data.conversationId === conversationId) {
                    setMessages(prev => {
                        // 1. Check if ID already exists
                        if (prev.some(m => m.id === data.id)) return prev;

                        // 2. Check if this is our own message arriving via SSE while we have an optimistic one
                        if (data.sender.id === currentUser.id) {
                            const optimisticIndex = prev.findLastIndex(m =>
                                m.id.toString().startsWith('temp-') &&
                                m.body === data.body &&
                                m.sender.id === currentUser.id
                            );

                            if (optimisticIndex !== -1) {
                                const newMessages = [...prev];
                                newMessages[optimisticIndex] = data;
                                return newMessages;
                            }
                        }

                        // 3. Otherwise add it
                        const next = [...prev, data];

                        // Deduplicate by ID just in case of races
                        return next.filter((m, index) =>
                            next.findIndex(m2 => m2.id === m.id) === index
                        );
                    });

                    // Mark as read when receiving a message in the active window
                    if (data.sender.id !== currentUser.id) {
                        fetch(`/api/conversations/${conversationId}/read`, { method: 'POST' });
                    }
                }
            } catch (e) {
                console.error("SSE parse error", e);
            }
        };

        eventSource.onerror = (e) => {
            console.error("SSE Connection Error", e);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [conversationId, currentUser.id]);

    const handleSendMessage = async (body: string) => {
        setIsLoading(true);
        try {
            // Optimistic update
            const tempId = 'temp-' + Date.now();
            const optimisticMsg = {
                id: tempId,
                body,
                createdAt: new Date().toISOString(),
                sender: currentUser,
                conversationId
            };
            setMessages(prev => [...prev, optimisticMsg]);

            const res = await fetch(`/api/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to send");

            // Update the temp message with the real one
            setMessages(prev => prev.map(m => m.id === tempId ? result.message : m));
        } catch (err) {
            console.error(err);
            // Remove optimistic message on error
            // TODO: Show error toast
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col h-full bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm", className)}>
            {title && (
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-[#0b224e]">{title}</h3>
                </div>
            )}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 scroll-smooth"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                        <p className="text-sm">Inizia la conversazione...</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isMe={msg.sender.id === currentUser.id}
                        />
                    ))
                )}
            </div>
            <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    );
}
