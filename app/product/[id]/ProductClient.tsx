"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "../../../context/UserContext";
import { useCart } from "@/context/CartContext";

type ProductMedia = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
};

type ApiProduct = {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  currency: string;
  premiumOnly: boolean;
  pointsEligible: boolean;
  pointsPrice: number | null;
  media: ProductMedia[];
};

type ProductClientProps = {
  product: ApiProduct;
};

const ProductClient = ({ product }: ProductClientProps) => {
  const { user, points, refresh } = useUser();
  const { addItem } = useCart();
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setCancelMessage(params.get("cancel") === "1");

    // Track view
    fetch(`/api/products/${product.id}/view`, { method: "POST" }).catch(() => { });
  }, [product.id]);

  const handleCheckout = async () => {
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
      if (payload?.url) {
        window.location.href = payload.url;
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

  const mainMedia = product.media[0];
  const mainUrl = mainMedia?.url ?? "https://picsum.photos/seed/obaldi/800/600";
  const cartImage =
    product.media.find((media) => media.type === "IMAGE")?.url ?? mainUrl;

  const isMember = Boolean(user?.isMember);
  const isPremium = Boolean(user?.isPremium);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      priceCents: product.priceCents,
      currency: product.currency,
      image: cartImage,
      qty: 1,
      pointsEligible: product.pointsEligible,
      pointsPrice: product.pointsPrice,
      premiumOnly: product.premiumOnly
    });
    if (!isMember) {
      window.location.href = "/membership";
      return;
    }
    setActionMessage("Prodotto aggiunto al carrello.");
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-16">
      <Link href="/marketplace" className="text-sm font-bold text-slate-400 hover:text-[#0b224e] mb-8 inline-block">
        ← Torna al Marketplace
      </Link>

      <div className="grid md:grid-cols-2 gap-16">
        <div>
          {mainMedia?.type === "VIDEO" ? (
            <video
              src={mainUrl}
              controls
              preload="metadata"
              className="w-full rounded-3xl shadow-sm border border-white/50"
            />
          ) : (
            <Image
              src={mainUrl}
              alt={product.title}
              width={800}
              height={600}
              className="w-full rounded-3xl shadow-sm border border-white/50"
            />
          )}
          <div className="grid grid-cols-4 gap-4 mt-4">
            {(product.media.length > 1 ? product.media.slice(1, 5) : []).map((media) => (
              <div key={media.id} className="aspect-square glass-panel overflow-hidden">
                {media.type === "VIDEO" ? (
                  <video
                    src={media.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={media.url}
                    alt=""
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
            {product.media.length === 0 && (
              <div className="aspect-square glass-panel overflow-hidden">
                <Image
                  src="https://picsum.photos/seed/1/200"
                  alt=""
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e] mb-4">{product.title}</h1>
          <div className="flex items-center space-x-4 mb-8">
            <div className="text-3xl font-black text-[#0b224e]">€{(product.priceCents / 100).toFixed(2)}</div>
            <div className="text-sm text-slate-400 font-medium">Spedizione inclusa per i membri</div>
            {product.premiumOnly && (
              <span className="text-xs font-bold text-[#a41f2e] uppercase tracking-wider">Solo Premium</span>
            )}
          </div>
          <div className="text-sm text-slate-500 mb-6">
            Punti: {product.pointsEligible && product.pointsPrice !== null ? `fino a ${product.pointsPrice}` : "non disponibili"}
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

          {isMember ? (
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
              {product.premiumOnly && !isPremium ? (
                <div className="glass-panel p-6 text-center">
                  <p className="text-sm font-medium text-slate-600 mb-4">
                    Questo prodotto è riservato ai membri Premium (Tutela).
                  </p>
                  <Link
                    href="/membership"
                    className="inline-block py-3 px-8 bg-[#a41f2e] text-white font-bold rounded-full shadow-glow-red"
                  >
                    Passa a Premium
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 border-2 border-slate-200 rounded-full font-bold text-[#0b224e] bg-white/70 hover:bg-white transition"
                  >
                    Aggiungi al carrello
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={actionLoading}
                    className="w-full py-4 bg-[#0b224e] text-white font-bold rounded-full hover:opacity-95 transition flex items-center justify-center shadow-glow-soft"
                  >
                    {actionLoading ? "Avvio pagamento..." : "Procedi all'acquisto"}
                  </button>
                  {isPremium && product.pointsEligible && product.pointsPrice !== null && (() => {
                    const maxPointsByPrice = Math.floor(product.priceCents / 100);
                    const maxPointsByProduct = product.pointsPrice ?? 0;
                    const maxPointsAllowed = Math.min(maxPointsByPrice, maxPointsByProduct);
                    const pointsToUse = Math.min(points, maxPointsAllowed);
                    const remainingCents = product.priceCents - pointsToUse * 100;
                    const remainingLabel = remainingCents > 0 ? ` + €${(remainingCents / 100).toFixed(2)}` : "";
                    const label =
                      pointsToUse > 0
                        ? `Usa ${pointsToUse} punti${remainingLabel}`
                        : "Punti non disponibili";

                    return (
                      <button
                        disabled={actionLoading || pointsToUse <= 0}
                        onClick={handlePointsPurchase}
                        className={`w-full py-4 border-2 rounded-lg font-bold transition flex items-center justify-center ${pointsToUse > 0
                            ? "border-slate-800 text-[#0b224e] bg-white/70 hover:bg-white"
                            : "border-slate-200 text-slate-300 cursor-not-allowed bg-white/40"
                          }`}
                      >
                        {actionLoading ? "Elaborazione..." : label}
                      </button>
                    );
                  })()}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="glass-panel p-6 text-center">
                <p className="text-sm font-medium text-slate-600 mb-4">
                  L&apos;acquisto di questo prodotto è riservato ai membri Obaldi.
                </p>
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 border-2 border-slate-200 rounded-full font-bold text-[#0b224e] bg-white/70 hover:bg-white transition"
                >
                  Registrati per aggiungere
                </button>
              </div>
              <Link
                href="/membership"
                className="inline-block text-center py-3 px-8 bg-[#a41f2e] text-white font-bold rounded-full shadow-glow-red"
              >
                Diventa membro ora
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductClient;
