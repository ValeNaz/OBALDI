"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useUser } from "../../../context/UserContext";

type ApiProduct = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  pointsEligible: boolean;
  pointsPrice: number | null;
};

const ProductDetail = () => {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user, points, refresh } = useUser();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`, {
          signal: controller.signal
        });
        if (!response.ok) return;
        const data = await response.json();
        setProduct(data.product ?? null);
      } catch {
        // Ignore fetch errors for now.
      }
    };

    load();
    return () => controller.abort();
  }, [params?.id]);

  const handleCheckout = async () => {
    if (!product) return;
    setActionError(null);
    setActionMessage(null);
    setActionLoading(true);
    try {
      const response = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty: 1 })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setActionError(payload?.error?.message ?? "Impossibile avviare l'acquisto.");
        return;
      }
      if (payload?.url) {
        window.location.href = payload.url;
      } else {
        setActionError("Impossibile avviare l'acquisto.");
      }
    } catch {
      setActionError("Impossibile avviare l'acquisto.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePointsPurchase = async () => {
    if (!product) return;
    setActionError(null);
    setActionMessage(null);
    setActionLoading(true);
    try {
      const response = await fetch("/api/points/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty: 1 })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setActionError(payload?.error?.message ?? "Impossibile completare l'acquisto.");
        return;
      }
      setActionMessage("Acquisto con punti completato.");
      await refresh();
    } catch {
      setActionError("Impossibile completare l'acquisto.");
    } finally {
      setActionLoading(false);
    }
  };

  const fullSpecs = [
    "Hardware Open Source basato su ARM",
    "Consumo energetico ridotto < 5W",
    "Sistema operativo ObaldiOS preinstallato",
    "Supporto tecnico prioritario 24/7"
  ];

  if (!product) {
    return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-16">
      <Link href="/marketplace" className="text-sm font-bold text-slate-400 hover:text-[#0b224e] mb-8 inline-block">
        ← Torna al Marketplace
      </Link>
      <div className="glass-panel card-pad text-center text-slate-500">
        Prodotto non disponibile.
      </div>
    </div>
  );
  }

  const cancelMessage = searchParams?.get("cancel") === "1";

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-16">
      <Link href="/marketplace" className="text-sm font-bold text-slate-400 hover:text-[#0b224e] mb-8 inline-block">
        ← Torna al Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-16">
        <div>
          <Image
            src="https://picsum.photos/seed/obaldi/800/600"
            alt={product.title}
            width={800}
            height={600}
            className="w-full rounded-3xl shadow-sm border border-white/50"
          />
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square glass-panel overflow-hidden">
                <Image
                  src={`https://picsum.photos/seed/${i}/200`}
                  alt=""
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-4">{product.title}</h1>
          <div className="flex items-center space-x-4 mb-8">
            <div className="text-3xl font-black text-[#0b224e]">€{(product.priceCents / 100).toFixed(2)}</div>
            <div className="text-sm text-slate-400 font-medium">Spedizione inclusa per i membri</div>
          </div>

          <p className="text-slate-600 mb-8 leading-relaxed">{product.description}</p>

          {cancelMessage && (
            <div className="mb-6 text-sm text-amber-700 font-semibold bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              Pagamento annullato. Puoi riprovare quando vuoi.
            </div>
          )}

          <div className="glass-panel p-6 mb-8">
            <h4 className="font-bold text-[#0b224e] mb-4 uppercase text-xs tracking-widest">Specifiche Tecniche</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              {fullSpecs.map((spec) => (
                <li key={spec} className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#a41f2e] rounded-full mr-3" /> {spec}
                </li>
              ))}
            </ul>
          </div>

          {user?.isMember ? (
            <div className="space-y-4">
              {actionError && (
                <div className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {actionError}
                </div>
              )}
              {actionMessage && (
                <div className="text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  {actionMessage}
                </div>
              )}
              <button
                onClick={handleCheckout}
                disabled={actionLoading}
                className="w-full py-4 bg-[#0b224e] text-white font-bold rounded-full hover:opacity-95 transition flex items-center justify-center shadow-glow-soft"
              >
                {actionLoading ? "Avvio pagamento..." : "Procedi all'acquisto"}
              </button>
              {user.isPremium && product.pointsEligible && product.pointsPrice !== null && (
                <button
                  disabled={actionLoading || points < (product.pointsPrice ?? 0)}
                  onClick={handlePointsPurchase}
                  className={`w-full py-4 border-2 rounded-lg font-bold transition flex items-center justify-center ${
                    points >= (product.pointsPrice ?? 0)
                      ? "border-slate-800 text-[#0b224e] bg-white/70 hover:bg-white"
                      : "border-slate-200 text-slate-300 cursor-not-allowed bg-white/40"
                  }`}
                >
                  {actionLoading ? "Elaborazione..." : `Paga con ${product.pointsPrice} Punti Obaldi`}
                </button>
              )}
            </div>
          ) : (
            <div className="glass-panel p-6 text-center">
              <p className="text-sm font-medium text-slate-600 mb-4">
                L&apos;acquisto di questo prodotto è riservato ai membri Obaldi.
              </p>
              <Link href="/membership" className="inline-block py-3 px-8 bg-[#a41f2e] text-white font-bold rounded-full shadow-glow-red">
                Diventa membro ora
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
