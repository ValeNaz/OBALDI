"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/button';

interface MessageInputProps {
    onSendMessage: (body: string) => void;
    isLoading?: boolean;
}

export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (!text.trim() || isLoading) return;
        onSendMessage(text);
        setText('');
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [text]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-end gap-2 p-3 bg-white border-t border-slate-100">
            <textarea
                ref={textareaRef}
                className="flex-1 max-h-[150px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#0b224e]/20 focus:border-[#0b224e] text-sm transition-all"
                placeholder="Scrivi un messaggio..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
            />
            <Button
                onClick={handleSend}
                disabled={!text.trim() || isLoading}
                className="h-10 w-10 p-0 rounded-full flex-shrink-0 bg-[#0b224e] hover:bg-[#0b224e]/90 shadow-md transition-all active:scale-95"
            >
                <Send size={18} />
            </Button>
        </div>
    );
}
