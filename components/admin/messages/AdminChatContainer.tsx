"use client";
import React, { useState, useEffect } from 'react';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import { Search, Info, User as UserIcon } from 'lucide-react';

interface AdminChatContainerProps {
    initialConversations: any[];
    currentUser: any;
}

export default function AdminChatContainer({ initialConversations, currentUser }: AdminChatContainerProps) {
    const [conversations, setConversations] = useState(initialConversations);
    const [activeId, setActiveId] = useState<string | null>(initialConversations[0]?.id || null);
    const [activeMessages, setActiveMessages] = useState<any[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'SUPPORT' | 'VENDOR_REPORT'>('ALL');

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
            console.error(err);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.participants?.some((p: any) => p.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesType = filterType === 'ALL' || c.type === filterType;
        return matchesSearch && matchesType;
    });

    const activeConv = conversations.find(c => c.id === activeId);
    const otherParticipant = activeConv?.participants?.find((p: any) => p.user.id !== currentUser.id)?.user;

    return (
        <div className="grid lg:grid-cols-4 gap-6 h-[750px] bg-white lg:bg-transparent rounded-3xl overflow-hidden shadow-2xl lg:shadow-none border border-slate-200 lg:border-none">
            <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden bg-white lg:bg-transparent lg:p-0">
                <div className="p-4 lg:p-2 space-y-3 bg-white lg:bg-transparent">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Cerca conversazione..."
                            className="w-full pl-10 pr-4 py-3 bg-white lg:bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0b224e]/10 focus:border-[#0b224e] shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {(['ALL', 'SUPPORT', 'VENDOR_REPORT'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-sm border ${filterType === type
                                    ? 'bg-[#0b224e] text-white border-[#0b224e]'
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                                    }`}
                            >
                                {type === 'ALL' ? 'Tutti' : type === 'SUPPORT' ? 'Supporto' : 'Segnalazioni'}
                            </button>
                        ))}
                    </div>
                </div>
                <ConversationList
                    conversations={filteredConversations}
                    activeId={activeId || undefined}
                    onSelect={setActiveId}
                    className="flex-1 border-slate-200/60"
                />
            </div>

            <div className="lg:col-span-2 h-full overflow-hidden">
                {activeId ? (
                    <ChatWindow
                        conversationId={activeId}
                        initialMessages={activeMessages}
                        currentUser={currentUser}
                        title={activeConv?.title}
                        className="h-full rounded-2xl border-slate-200/60 bg-white"
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl text-slate-400 p-12 text-center shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-4xl mb-6">
                            📥
                        </div>
                        <h3 className="text-slate-900 font-bold text-xl mb-2">Inbox Admin</h3>
                        <p className="text-slate-500 max-w-xs mx-auto">
                            Seleziona una conversazione dalla lista per visualizzare i messaggi e gestire la richiesta.
                        </p>
                    </div>
                )}
            </div>

            <div className="lg:col-span-1 h-full overflow-y-auto hidden lg:block">
                {activeConv ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                                <Info size={14} className="text-[#0b224e]" /> Dettagli Utente
                            </h4>
                            <div className="flex flex-col items-center text-center gap-3 mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0b224e] to-[#0b224e]/80 flex items-center justify-center text-3xl text-white font-black shadow-lg shadow-[#0b224e]/20">
                                    {otherParticipant?.firstName?.[0] || 'U'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 leading-tight">
                                        {otherParticipant?.firstName} {otherParticipant?.lastName}
                                    </h3>
                                    <p className="text-xs text-[#0b224e] font-medium bg-[#0b224e]/5 px-2 py-0.5 rounded-full mt-1">
                                        {otherParticipant?.email}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-medium tracking-wide">RUOLO</span>
                                    <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{otherParticipant?.role}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-medium tracking-wide">TIPO CHAT</span>
                                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{activeConv.type}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-medium tracking-wide">ID UTENTE</span>
                                    <span className="font-mono text-[10px] text-slate-500 truncate ml-4" title={otherParticipant?.id}>
                                        {otherParticipant?.id.substring(0, 8)}...
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Azioni Gestionali</h4>
                            <div className="grid grid-cols-1 gap-3">
                                <button className="w-full text-center py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all">
                                    Storico Ordini
                                </button>
                                <button className="w-full text-center py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-all">
                                    Dettaglio Profilo
                                </button>
                                <div className="pt-3 space-y-3">
                                    <button
                                        onClick={async () => {
                                            if (confirm('Sei sicuro di voler azzerare tutti i messaggi di questa conversazione?')) {
                                                const res = await fetch(`/api/conversations/${activeId}/messages`, { method: 'DELETE' });
                                                if (res.ok) {
                                                    setActiveMessages([]);
                                                }
                                            }
                                        }}
                                        className="w-full text-center py-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-700 transition-all"
                                    >
                                        Azzera Messaggi
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Chiudere questa conversazione?')) {
                                                const res = await fetch(`/api/conversations/${activeId}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ status: 'CLOSED' })
                                                });
                                                if (res.ok) {
                                                    setConversations(prev => prev.map(c => c.id === activeId ? { ...c, status: 'CLOSED' } : c));
                                                }
                                            }
                                        }}
                                        className="w-full text-center py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-600 transition-all"
                                    >
                                        Chiudi Conversazione
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-sm text-center px-8 bg-white/40 rounded-3xl border border-dashed border-slate-200">
                        <UserIcon size={48} className="mb-4 opacity-10" />
                        <p className="max-w-[150px]">Seleziona una chat per vedere i dettagli dell&apos;interlocutore</p>
                    </div>
                )}
            </div>
        </div>
    );
}
