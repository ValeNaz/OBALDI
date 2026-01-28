"use client";
import React, { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import { Button } from '../ui/button';
import { Plus, MessageSquare } from 'lucide-react';

interface ChatContainerProps {
    initialConversations: any[];
    currentUser: any;
    newConversationType?: 'SUPPORT' | 'VENDOR_REPORT';
    newConversationLabel?: string;
}

export default function ChatContainer({
    initialConversations,
    currentUser,
    newConversationType = 'SUPPORT',
    newConversationLabel = 'Nuova Conversazione'
}: ChatContainerProps) {
    const [conversations, setConversations] = useState(initialConversations);
    const [activeId, setActiveId] = useState<string | null>(initialConversations[0]?.id || null);
    const [activeMessages, setActiveMessages] = useState<any[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (activeId) {
            fetchMessages(activeId);
        }
    }, [activeId]);

    const fetchMessages = async (id: string) => {
        setIsLoadingMessages(true);
        try {
            const res = await fetch(`/api/conversations/${id}/messages`);
            const data = await res.json();
            if (res.ok) {
                setActiveMessages(data.messages);
            }
        } catch (err) {
            console.error("Fetch messages error", err);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const handleStartSupport = async () => {
        setIsCreating(true);
        try {
            const res = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: newConversationType,
                    title: newConversationType === 'VENDOR_REPORT' ? 'Segnalazione Venditore' : 'Supporto Obaldi'
                })
            });
            const data = await res.json();
            if (res.ok) {
                setConversations(prev => {
                    if (prev.some(c => c.id === data.conversation.id)) return prev;
                    return [data.conversation, ...prev];
                });
                setActiveId(data.conversation.id);
            }
        } catch (err) {
            console.error("Start support error", err);
        } finally {
            setIsCreating(false);
        }
    };

    const activeConv = conversations.find(c => c.id === activeId);

    return (
        <div className="flex flex-col lg:flex-row h-[700px] gap-6">
            <div className="w-full lg:w-80 h-full flex flex-col gap-4">
                <Button
                    onClick={handleStartSupport}
                    disabled={isCreating}
                    className="w-full rounded-2xl h-14 bg-[#0b224e] hover:bg-[#0b224e]/90 text-white font-bold shadow-lg shadow-[#0b224e]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isCreating ? (
                        <span className="animate-spin">⏳</span>
                    ) : (
                        <>
                            <Plus size={20} />
                            <span>{newConversationLabel}</span>
                        </>
                    )}
                </Button>
                <ConversationList
                    conversations={conversations}
                    activeId={activeId || undefined}
                    onSelect={setActiveId}
                    className="flex-1"
                />
            </div>
            <div className="flex-1 h-full min-h-0">
                {activeId ? (
                    <ChatWindow
                        conversationId={activeId}
                        initialMessages={activeMessages}
                        currentUser={currentUser}
                        title={activeConv?.title}
                        className="h-full"
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl text-slate-400 p-12 text-center shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-4xl mb-6 shadow-inner">
                            <MessageSquare size={40} className="text-slate-200" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-xl mb-2">I tuoi Messaggi</h3>
                        <p className="text-slate-500 max-w-xs mx-auto leading-relaxed">
                            Tutte le tue conversazioni con il supporto e le segnalazioni venditori appariranno qui.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
