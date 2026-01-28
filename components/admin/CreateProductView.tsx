"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/dashboard/ProductForm";

export default function CreateProductView({ userRole, userId, redirectBase = "/admin/products" }: { userRole: "ADMIN" | "SELLER", userId: string, redirectBase?: string }) {
    const router = useRouter();

    const handleCreate = async (data: any, files?: File[]) => {
        try {
            const apiEndpoint = userRole === "SELLER" ? "/api/seller/products" : "/api/admin/products";
            const payloadData = {
                ...data,
                specsJson: typeof data.specsJson === 'string' ? JSON.parse(data.specsJson || '{}') : data.specsJson
            };

            console.log("Sending payload:", payloadData);

            const res = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payloadData)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error?.message || "Errore creazione prodotto");
            }

            const payload = await res.json();
            const newProduct = payload.product;

            // Upload initial images if any
            if (files && files.length > 0) {
                // Show some feedback ideally, but we are about to redirect
                // We'll just await them
                for (const file of files) {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("productId", newProduct.id);
                    formData.append("mediaType", file.type.startsWith("video/") ? "VIDEO" : "IMAGE");

                    await fetch("/api/upload", {
                        method: "POST",
                        body: formData
                    });
                }
            }

            // Redirect to the full editor
            router.push(`${redirectBase}/${newProduct.id}`);
            return newProduct;
        } catch (err: any) {
            alert(err.message);
            throw err;
        }
    };

    return (
        <div className="container-max page-pad py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-[#0b224e] mb-2">Crea Nuovo Prodotto</h1>
                <p className="text-slate-500 mb-8">Inserisci le informazioni di base. Potrai aggiungere varianti e immagini dopo il salvataggio.</p>

                <ProductForm
                    role={userRole}
                    userId={userId}
                    onSubmit={handleCreate}
                    onCancel={() => router.back()}
                />
            </div>
        </div>
    );
}
