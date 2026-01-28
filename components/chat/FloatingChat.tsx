"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minus, Maximize2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function FloatingChat() {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [conversation, setConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Only show for logged in users who are not admins

    useEffect(() => {
        if (isOpen && user) {
            fetchSupportConversation();
            setUnreadCount(0);
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (conversation?.id && user) {
            const eventSource = new EventSource('/api/sse/chat');
            eventSource.onmessage = (event) => {
                const { type, data } = JSON.parse(event.data);
                if (type === 'clear' && data.conversationId === conversation.id) {
                    setMessages([]);
                }
                if (type === 'message' && data.conversationId === conversation.id) {
                    setMessages(prev => {
                        // 1. Check if ID already exists
                        if (prev.some(m => m.id === data.id)) return prev;

                        // 2. Check if this is our own message arriving via SSE while we have an optimistic one
                        if (data.senderId === user.id) {
                            const optimisticIndex = prev.findLastIndex(m =>
                                m.id.toString().startsWith('temp-') &&
                                m.body === data.body &&
                                m.senderId === user.id
                            );

                            if (optimisticIndex !== -1) {
                                const newMessages = [...prev];
                                newMessages[optimisticIndex] = data;
                                return newMessages;
                            }
                        }

                        // 3. Otherwise add it
                        return [...prev, data];
                    });

                    if (!isOpen || isMinimized) {
                        setUnreadCount(prev => prev + 1);
                    }
                }
            };
            return () => eventSource.close();
        }
    }, [conversation?.id, isOpen, isMinimized, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Only render for logged in users who are not admins
    if (!user || user.role === 'ADMIN') return null;

    const fetchSupportConversation = async () => {
        setIsLoading(true);
        try {
            // Find or create support conversation
            const res = await fetch('/api/conversations?type=SUPPORT');
            const data = await res.json();

            let supportConv = data.conversations?.find((c: any) => c.type === 'SUPPORT');

            if (!supportConv) {
                // Create one if it doesn't exist
                const createRes = await fetch('/api/conversations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'SUPPORT', title: 'Supporto Obaldi' })
                });
                const createData = await createRes.json();
                supportConv = createData.conversation;
            }

            setConversation(supportConv);

            if (supportConv) {
                const msgRes = await fetch(`/api/conversations/${supportConv.id}/messages`);
                const msgData = await msgRes.json();
                setMessages(msgData.messages || []);
            }
        } catch (err) {
            console.error("FloatingChat error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (body: string) => {
        if (!conversation || !user) return;

        // Optimistic update
        const tempId = 'temp-' + Date.now();
        const tempMsg = {
            id: tempId,
            body,
            senderId: user.id,
            sender: user,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body })
            });
            const result = await res.json();
            if (res.ok) {
                // Replace the temp message with the real one from response 
                // (SSE might also do this, but doing it here ensures it's replaced even if SSE is slow)
                setMessages(prev => prev.map(m => m.id === tempId ? result.message : m));
            }
        } catch (err) {
            console.error("Send message error:", err);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div
                    className={cn(
                        "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden flex flex-col mb-4",
                        isMinimized ? "h-14 w-64" : "h-[500px] w-[350px] md:w-[400px]"
                    )}
                >
                    {/* Header */}
                    <div className="bg-[#0b224e] p-4 text-white flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="font-bold text-sm">Supporto Obaldi</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-white/10 rounded">
                                {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-white/10 rounded">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages Container */}
                            <div
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50"
                            >
                                {isLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b224e]" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-slate-400 mt-10">
                                        <p className="text-sm">Ciao {user.firstName}! 👋</p>
                                        <p className="text-xs mt-1">Come possiamo aiutarti oggi?</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <MessageBubble
                                            key={msg.id}
                                            message={msg}
                                            isMe={msg.senderId === user.id}
                                        />
                                    ))
                                )}
                            </div>

                            {/* Input */}
                            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                                <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    setIsMinimized(false);
                }}
                className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-110 active:scale-95 relative",
                    isOpen ? "bg-[#a41f2e]" : "bg-[#0b224e]"
                )}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}

                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 bg-[#a41f2e] text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
}
