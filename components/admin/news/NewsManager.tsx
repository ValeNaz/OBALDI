"use client";

import { useEffect, useState } from "react";
import { FaNewspaper, FaPen, FaTrash, FaPlus, FaCheck, FaTimes, FaSearch, FaEye } from "react-icons/fa";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import DOMPurify from "dompurify";

type NewsPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string;
    tags: string[];
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
    updatedAt: string;
};

import { useUI } from "@/context/UIContext";

export default function NewsManager() {
    const { showToast, confirm } = useUI();
    const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
    const [newsStatus, setNewsStatus] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");
    const [newsLoading, setNewsLoading] = useState(false);
    const [newsError, setNewsError] = useState<string | null>(null);

    // Form State
    const [newsTitle, setNewsTitle] = useState("");
    const [newsSlug, setNewsSlug] = useState("");
    const [newsExcerpt, setNewsExcerpt] = useState("");
    const [newsBody, setNewsBody] = useState("");
    const [newsTags, setNewsTags] = useState("");
    const [newsStatusForm, setNewsStatusForm] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
    const [newsSaving, setNewsSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            try {
                setNewsLoading(true);
                setNewsError(null);
                const query = newsStatus === "ALL" ? "" : `?status=${newsStatus}`;
                const response = await fetch(`/api/admin/news${query}`, { signal: controller.signal });
                if (!response.ok) {
                    setNewsError("Impossibile caricare le news.");
                    return;
                }
                const data = await response.json();
                setNewsPosts(data.posts ?? []);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    setNewsError("Impossibile caricare le news.");
                }
            } finally {
                setNewsLoading(false);
            }
        };

        load();
        return () => controller.abort();
    }, [newsStatus]);

    const slugify = (value: string) =>
        value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

    const handleNewsCreate = async () => {
        setNewsError(null);
        if (!newsTitle.trim() || !newsBody.trim()) {
            setNewsError("Titolo e contenuto sono obbligatori.");
            return;
        }
        setNewsSaving(true);
        try {
            const tags = newsTags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);

            const response = await fetch("/api/admin/news", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newsTitle.trim(),
                    slug: newsSlug.trim() || slugify(newsTitle),
                    excerpt: newsExcerpt.trim() || undefined,
                    body: DOMPurify.sanitize(newsBody.trim()),
                    tags,
                    status: newsStatusForm
                })
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                setNewsError(payload?.error?.message ?? "Impossibile creare la news.");
                return;
            }

            setNewsPosts((prev) => [payload.post, ...prev]);
            showToast("News creata con successo", "success");

            // Reset form
            setNewsTitle("");
            setNewsSlug("");
            setNewsExcerpt("");
            setNewsBody("");
            setNewsTags("");
            setNewsStatusForm("DRAFT");
            setShowForm(false);
        } catch {
            setNewsError("Impossibile creare la news.");
        } finally {
            setNewsSaving(false);
        }
    };

    const handleNewsDelete = async (post: NewsPost) => {
        const confirmed = await confirm({
            title: "Elimina News",
            message: `Sei sicuro di voler eliminare la news "${post.title}"?`,
            confirmText: "Elimina",
            variant: "danger"
        });
        if (!confirmed) return;

        const response = await fetch(`/api/admin/news/${post.id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            showToast("Impossibile eliminare la news.", "error");
            return;
        }
        setNewsPosts((prev) => prev.filter((item) => item.id !== post.id));
        showToast("News eliminata", "success");
    };

    const handleToggleStatus = async (post: NewsPost) => {
        const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
        const response = await fetch(`/api/admin/news/${post.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            const payload = await response.json();
            setNewsPosts(prev => prev.map(p => p.id === post.id ? payload.post : p));
            showToast(`News ${newStatus === "PUBLISHED" ? "pubblicata" : "spostata in bozze"}`, "success");
        }
    };

    return (
        <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-white/70 flex flex-wrap gap-4 items-center justify-between">
                <h2 className="text-xl font-bold text-[#0b224e] flex items-center gap-2">
                    <FaNewspaper /> News
                </h2>
                <div className="flex gap-2">
                    <select
                        className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                        value={newsStatus}
                        onChange={(e) => setNewsStatus(e.target.value as any)}
                    >
                        <option value="ALL">Tutti gli stati</option>
                        <option value="PUBLISHED">Pubblicati</option>
                        <option value="DRAFT">Bozze</option>
                    </select>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn btn-primary text-sm flex items-center gap-2"
                    >
                        <FaPlus /> Nuova News
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="p-6 bg-slate-50 border-b border-slate-100 animate-in fade-in slide-in-from-top-4">
                    <h3 className="font-bold text-[#0b224e] mb-4">Nuovo Articolo</h3>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                placeholder="Titolo"
                                className="p-2 border rounded"
                                value={newsTitle}
                                onChange={e => setNewsTitle(e.target.value)}
                            />
                            <input
                                placeholder="Slug (opzionale)"
                                className="p-2 border rounded"
                                value={newsSlug}
                                onChange={e => setNewsSlug(e.target.value)}
                            />
                        </div>
                        <textarea
                            placeholder="Estratto (opzionale)"
                            className="p-2 border rounded h-20"
                            value={newsExcerpt}
                            onChange={e => setNewsExcerpt(e.target.value)}
                        />
                        <textarea
                            placeholder="Contenuto (Markdown supportato)"
                            className="p-2 border rounded h-40 font-mono text-sm"
                            value={newsBody}
                            onChange={e => setNewsBody(e.target.value)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                placeholder="Tags (separati da virgola)"
                                className="p-2 border rounded"
                                value={newsTags}
                                onChange={e => setNewsTags(e.target.value)}
                            />
                            <select
                                className="p-2 border rounded"
                                value={newsStatusForm}
                                onChange={e => setNewsStatusForm(e.target.value as any)}
                            >
                                <option value="DRAFT">Bozza</option>
                                <option value="PUBLISHED">Pubblicato</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded">Annulla</button>
                            <button onClick={handleNewsCreate} disabled={newsSaving} className="btn btn-primary">
                                {newsSaving ? "Salvataggio..." : "Crea News"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {newsError && (
                <div className="p-6 text-center text-red-600 bg-red-50">
                    {newsError}
                </div>
            )}

            {newsLoading && !newsError ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 hidden sm:table-cell">Data</th>
                                <th className="px-6 py-4">Articolo</th>
                                <th className="px-6 py-4 hidden md:table-cell">Stato & Tags</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-slate-50">
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-3 w-16" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-40 mb-2" />
                                        <Skeleton className="h-3 w-24" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <Skeleton className="h-4 w-20 rounded-full" />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Skeleton className="h-8 w-16 rounded-full ml-auto" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest font-bold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Titolo / Slug</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {newsPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12">
                                        <EmptyState
                                            icon={<FaNewspaper size={24} />}
                                            title="Nessuna news"
                                            description="Non abbiamo trovato articoli che corrispondano ai criteri."
                                            action={
                                                <button onClick={() => setShowForm(true)} className="btn btn-primary text-xs">Crea primo articolo</button>
                                            }
                                        />
                                    </td>
                                </tr>
                            ) : (
                                newsPosts.map(post => (
                                    <tr key={post.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 hidden sm:table-cell text-xs text-slate-500">
                                            {new Date(post.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-[#0b224e] text-xs md:text-sm line-clamp-1">{post.title}</div>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">{post.slug}</span>
                                                <span className="text-[9px] text-slate-400 sm:hidden">
                                                    {new Date(post.updatedAt).toLocaleDateString()}
                                                </span>
                                                <span className={`md:hidden inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {post.status === 'PUBLISHED' ? 'PUBBLICATO' : 'BOZZA'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="flex flex-col gap-2">
                                                <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-bold ${post.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {post.status === 'PUBLISHED' ? 'PUBBLICATO' : 'BOZZA'}
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {post.tags.map(tag => (
                                                        <span key={tag} className="text-[10px] text-slate-400">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleToggleStatus(post)}
                                                className="p-2 text-slate-400 hover:text-[#0b224e] hover:bg-slate-100 rounded-full transition"
                                                title={post.status === 'PUBLISHED' ? "Sposta in bozze" : "Pubblica"}
                                            >
                                                {post.status === 'PUBLISHED' ? <FaTimes /> : <FaCheck />}
                                            </button>
                                            <button
                                                onClick={() => handleNewsDelete(post)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
