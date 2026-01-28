"use client";

import { useState } from "react";
import Image from "next/image";

export type UploadedMedia = {
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO";
    sortOrder: number;
};

type ImageManagerProps = {
    productId: string;
    initialMedia?: UploadedMedia[];
    role: "ADMIN" | "SELLER";
    onMediaChange?: (media: UploadedMedia[]) => void;
};

import { useUI } from "@/context/UIContext";

const ImageManager = ({ productId, initialMedia = [], role, onMediaChange }: ImageManagerProps) => {
    const { showToast, confirm } = useUI();
    const [mediaItems, setMediaItems] = useState<UploadedMedia[]>(initialMedia);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);


    // Use local upload endpoint for reliability in this env
    const endpoint = "/api/upload";

    const handleMediaUpload = async (files: FileList | null) => {
        if (!files || !productId) return;
        setUploadError(null);
        setUploading(true);
        const uploads = Array.from(files);

        const newItems: UploadedMedia[] = [];

        for (const file of uploads) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("productId", productId);
            formData.append("mediaType", file.type.startsWith("video/") ? "VIDEO" : "IMAGE");

            try {
                const response = await fetch(endpoint, {
                    method: "POST",
                    body: formData
                });

                const payload = await response.json().catch(() => null);

                if (!response.ok) {
                    setUploadError(payload?.error?.message ?? "Errore durante l'upload.");
                    continue;
                }

                if (payload?.media) {
                    newItems.push(payload.media);
                }
            } catch (err) {
                console.error(err);
                setUploadError("Errore imprevisto durante l'upload.");
            }
        }

        if (newItems.length > 0) {
            setMediaItems((prev) => {
                const updated = [...prev, ...newItems].sort((a, b) => a.sortOrder - b.sortOrder);
                onMediaChange?.(updated);
                return updated;
            });
            showToast(`${newItems.length} file caricati con successo`, "success");
        }
        setUploading(false);
    };

    const handleRemove = async (mediaId: string) => {
        const confirmed = await confirm({
            title: "Rimuovi Media",
            message: "Vuoi eliminare definitivamente questo file? Questa azione non può essere annullata.",
            confirmText: "Rimuovi",
            variant: "danger"
        });
        if (!confirmed) return;

        try {
            // For now, only ADMIN has a dedicated DELETE endpoint
            if (role === "ADMIN") {
                const response = await fetch(`/api/admin/products/media/${mediaId}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    const payload = await response.json().catch(() => null);
                    showToast(payload?.error?.message ?? "Errore durante l'eliminazione dal server.", "error");
                    return;
                }
            }

            // Update local state if API succeeded or if not in admin mode (fallback)
            setMediaItems(prev => {
                const updated = prev.filter(m => m.id !== mediaId);
                onMediaChange?.(updated);
                return updated;
            });
            showToast("File rimosso", "success");
        } catch (err) {
            console.error(err);
            showToast("Errore durante l'eliminazione.", "error");
        }
    };

    return (
        <div className="glass-panel p-6 border border-white/60">
            <h3 className="text-sm font-bold text-[#0b224e] mb-3">Galleria Immagini</h3>
            <p className="text-xs text-slate-500 mb-4">
                Formati: JPG, PNG, WEBP. Max 10MB.
            </p>

            {uploadError && <p className="text-xs text-red-600 font-semibold mb-3">{uploadError}</p>}

            <div className="mb-4">
                <label className="inline-block cursor-pointer bg-white border border-dashed border-slate-300 rounded-xl px-6 py-4 hover:bg-slate-50 transition w-full text-center">
                    <span className="text-sm font-bold text-slate-600">{uploading ? "Caricamento..." : "Clicca per caricare immagini"}</span>
                    <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                        disabled={uploading}
                        onChange={(event) => handleMediaUpload(event.target.files)}
                        className="hidden"
                    />
                </label>
            </div>

            {mediaItems.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {mediaItems.map((media) => (
                        <div key={media.id} className="relative aspect-square glass-panel overflow-hidden group">
                            {media.type === "VIDEO" ? (
                                <video
                                    src={media.url}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Image src={media.url} alt="" fill className="object-cover" />
                            )}
                            <button
                                type="button"
                                onClick={() => handleRemove(media.id)}
                                className="absolute top-1 right-1 bg-red-600/90 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageManager;
