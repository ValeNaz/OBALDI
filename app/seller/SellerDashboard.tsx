"use client";

import { useState, useEffect } from "react";
import ProductForm from "@/components/dashboard/ProductForm";

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await fetch("/api/seller/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products ?? []);
      } else {
        setError("Impossibile caricare i prodotti.");
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleProductSubmit = async (data: any) => {
    const isEdit = !!data.id;
    const url = isEdit ? `/api/seller/products/${data.id}` : "/api/seller/products";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const requestBody = {
        ...data,
        specsJson: typeof data.specsJson === 'string' ? JSON.parse(data.specsJson || '{}') : data.specsJson
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Errore: " + (err.error?.message ?? "generico"));
        return;
      }

      const payload = await res.json();
      const savedProduct = payload.product;

      if (isEdit) {
        setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
      } else {
        setProducts(prev => [savedProduct, ...prev]);
      }
      return savedProduct;
    } catch {
      alert("Errore di connessione");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminare definitivamente questo prodotto?")) return;
    try {
      const res = await fetch(`/api/seller/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Impossibile eliminare.");
      }
    } catch {
      alert("Errore di connessione");
    }
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-16">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-[#0b224e]">Dashboard Venditore</h1>
        <button
          onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
          className="bg-[#0b224e] text-white px-6 py-2 rounded-full font-bold shadow-glow-soft hover:shadow-lg transition"
        >
          + Nuovo Prodotto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Caricamento prodotti...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-slate-500 mb-4">Non hai ancora inserito prodotti.</p>
          <button
            onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
            className="text-[#0b224e] font-bold underline"
          >
            Inizia ora
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="glass-panel p-6 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-[#0b224e] text-lg leading-tight">{product.title}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${product.status === "APPROVED" ? "bg-green-100 text-green-700" :
                  product.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                    "bg-slate-100 text-slate-500"
                  }`}>
                  {product.status}
                </span>
              </div>
              <div className="mb-4 text-slate-500 text-sm flex-grow line-clamp-3">
                {product.description}
              </div>
              <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                <span className="font-bold text-[#0b224e]">€{(product.priceCents / 100).toFixed(2)}</span>
                <div className="flex gap-3 text-sm font-bold">
                  <button
                    onClick={() => { setEditingProduct(product); setShowProductForm(true); }}
                    className="text-slate-500 hover:text-[#0b224e]"
                  >
                    Modifica
                  </button>
                  {product.status === "DRAFT" || product.status === "REJECTED" ? (
                    <button
                      onClick={async () => {
                        if (!confirm("Inviare per la revisione?")) return;
                        const res = await fetch(`/api/seller/products/${product.id}/submit`, { method: "POST" });
                        if (res.ok) {
                          alert("Prodotto inviato!");
                          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: "PENDING" } : p));
                        } else {
                          alert("Errore invio.");
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Invia
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-400 hover:text-red-700"
                  >
                    Elimina
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <ProductForm
              role="SELLER"
              initialData={editingProduct ? {
                id: editingProduct.id,
                title: editingProduct.title,
                description: editingProduct.description,
                priceCents: editingProduct.priceCents,
                premiumOnly: editingProduct.premiumOnly,
                pointsEligible: editingProduct.pointsEligible,
                pointsPrice: editingProduct.pointsPrice,
                specsJson: typeof editingProduct.specsJson === 'string' ? editingProduct.specsJson : JSON.stringify(editingProduct.specsJson),
                images: editingProduct.media
              } : undefined}
              onSubmit={async (data) => {
                const saved = await handleProductSubmit(data);
                if (saved) {
                  setEditingProduct(saved);
                  alert("Prodotto salvato correttamente!");
                  if (editingProduct) { // If it was an edit, close the form? user might want to keep adding images.
                    // Let's decide: if Create -> Keep open. If Update -> Close.
                    // Actually, let's keep it open but show alert.
                  }
                }
              }}
              onCancel={() => setShowProductForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
