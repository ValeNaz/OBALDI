"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "primary";
    showPrompt?: boolean;
    promptPlaceholder?: string;
}

interface UIContextType {
    showToast: (message: string, type?: ToastType) => void;
    confirm: (options: ConfirmOptions) => Promise<string | boolean>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmState, setConfirmState] = useState<{
        options: ConfirmOptions;
        resolve: (value: string | boolean) => void;
    } | null>(null);
    const [promptValue, setPromptValue] = useState("");

    const showToast = useCallback((message: string, type: ToastType = "success") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const confirm = useCallback((options: ConfirmOptions): Promise<string | boolean> => {
        return new Promise((resolve) => {
            setConfirmState({ options, resolve });
            setPromptValue("");
        });
    }, []);

    const handleConfirm = () => {
        if (confirmState) {
            if (confirmState.options.showPrompt) {
                confirmState.resolve(promptValue);
            } else {
                confirmState.resolve(true);
            }
            setConfirmState(null);
        }
    };

    const handleCancel = () => {
        if (confirmState) {
            confirmState.resolve(false);
            setConfirmState(null);
        }
    };

    return (
        <UIContext.Provider value={{ showToast, confirm }}>
            {children}

            {/* Toasts Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${toast.type === "success"
                                    ? "bg-white border-green-100 text-green-800"
                                    : toast.type === "error"
                                        ? "bg-white border-red-100 text-red-800"
                                        : "bg-white border-blue-100 text-blue-800"
                                }`}
                        >
                            {toast.type === "success" && <FaCheckCircle className="text-xl text-green-500" />}
                            {toast.type === "error" && <FaExclamationCircle className="text-xl text-red-500" />}
                            {toast.type === "info" && <FaInfoCircle className="text-xl text-blue-500" />}
                            <span className="font-semibold text-sm">{toast.message}</span>
                            <button
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                className="ml-2 text-slate-400 hover:text-slate-600 transition"
                            >
                                <FaTimes size={12} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmState && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCancel}
                            className="absolute inset-0 bg-[#0b224e]/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <h3 className="text-xl font-bold text-[#0b224e] mb-2">
                                    {confirmState.options.title}
                                </h3>
                                <p className="text-slate-600 mb-6 font-medium">
                                    {confirmState.options.message}
                                </p>

                                {confirmState.options.showPrompt && (
                                    <div className="mb-6">
                                        <textarea
                                            value={promptValue}
                                            onChange={(e) => setPromptValue(e.target.value)}
                                            placeholder={confirmState.options.promptPlaceholder || "Scrivi qui..."}
                                            className="w-full glass-input min-h-[100px] p-4 text-sm focus:ring-2 focus:ring-[#0b224e]/20"
                                            autoFocus
                                        />
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancel}
                                        className="flex-1 px-6 py-3 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition border border-slate-100"
                                    >
                                        {confirmState.options.cancelText || "Annulla"}
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className={`flex-1 px-6 py-3 rounded-2xl font-bold text-white transition shadow-lg ${confirmState.options.variant === "danger"
                                                ? "bg-[#a41f2e] hover:bg-red-700 shadow-red-200"
                                                : "bg-[#0b224e] hover:bg-[#15346d] shadow-blue-200"
                                            }`}
                                    >
                                        {confirmState.options.confirmText || "Conferma"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) {
        throw new Error("useUI must be used within a UIProvider");
    }
    return context;
};
