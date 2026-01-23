"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";

const CheckoutPage = () => {
  const { user, points } = useUser();
  const { items, updateQty, removeItem, clearCart } = useCart();
  const [usePoints, setUsePoints] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const totals = useMemo(() => {
    const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
    const pointsCap = items.reduce((sum, item) => {
      if (!item.pointsEligible || !item.pointsPrice) return sum;
      const maxByPrice = Math.floor(item.priceCents / 100);
      const maxByProduct = item.pointsPrice;
      const perUnit = Math.min(maxByPrice, maxByProduct);
      return sum + perUnit * item.qty;
    }, 0);
    const pointsToUse =
      user?.isPremium && usePoints ? Math.min(pointsCap, points) : 0;
    const remainingCents = Math.max(0, totalCents - pointsToUse * 100);
    return { totalCents, pointsCap, pointsToUse, remainingCents };
  }, [items, points, usePoints, user?.isPremium]);

  const handleCheckout = async () => {
    setCheckoutError(null);
    setCheckoutMessage(null);
    if (!user?.isMember) {
      setCheckoutError("Per acquistare devi essere membro Obaldi.");
      return;
    }
    if (items.length === 0) {
      setCheckoutError("Il carrello e vuoto.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usePoints: user.isPremium && usePoints,
          items: items.map((item) => ({ productId: item.productId, qty: item.qty }))
        })
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setCheckoutError(payload?.error?.message ?? "Impossibile avviare il checkout.");
        return;
      }
      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }
      if (payload?.orderId) {
        setCheckoutMessage("Ordine completato con i punti disponibili.");
        clearCart();
        return;
      }
      setCheckoutError("Impossibile completare il checkout.");
    } catch {
      setCheckoutError("Impossibile avviare il checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Checkout</h1>
          <p className="text-slate-500 mt-2">Riepilogo ordine e pagamento.</p>
        </div>
        {!user?.isMember && (
          <Link
            href="/membership"
            className="rounded-full bg-[#0b224e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1a3a6e]"
          >
            Registrati per acquistare
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="glass-panel p-10 text-center text-slate-500 space-y-4">
          <div>Nessun prodotto nel carrello.</div>
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center rounded-full bg-[#0b224e] px-6 py-2 text-xs font-semibold text-white hover:bg-[#1a3a6e]"
          >
            Vai al marketplace
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.productId} className="glass-panel p-6 flex flex-col md:flex-row gap-6">
                <div className="relative w-full md:w-40 aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image src={item.image} alt={item.title} fill sizes="200px" className="object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#0b224e]">{item.title}</h3>
                      <div className="text-xs text-slate-500 mt-1">
                        Punti: {item.pointsEligible && item.pointsPrice ? `fino a ${item.pointsPrice}` : "non disponibili"}
                      </div>
                      {item.premiumOnly && (
                        <span className="inline-block mt-2 text-[10px] uppercase tracking-wider font-bold text-[#a41f2e]">
                          Solo Premium
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-xs font-semibold text-slate-400 hover:text-[#a41f2e]"
                    >
                      Rimuovi
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1))}
                        className="h-7 w-7 rounded-full bg-white text-slate-700"
                        aria-label="Riduci quantita"
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold text-slate-700">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="h-7 w-7 rounded-full bg-white text-slate-700"
                        aria-label="Aumenta quantita"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-lg font-bold text-[#0b224e]">
                      €{(item.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel p-6 h-fit space-y-5">
            <h2 className="text-xl font-semibold text-[#0b224e]">Riepilogo</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Totale prodotti</span>
                <span>€{(totals.totalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Punti applicabili</span>
                <span>{totals.pointsCap}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#0b224e]">
                <span>Saldo finale</span>
                <span>€{(totals.remainingCents / 100).toFixed(2)}</span>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(event) => setUsePoints(event.target.checked)}
                disabled={!user?.isPremium || totals.pointsCap === 0}
              />
              Usa punti disponibili ({points})
            </label>

            {checkoutError && (
              <div className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {checkoutError}
              </div>
            )}
            {checkoutMessage && (
              <div className="text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                {checkoutMessage}
              </div>
            )}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full py-3 rounded-full bg-[#0b224e] text-white font-semibold hover:bg-[#1a3a6e] disabled:opacity-60"
            >
              {checkoutLoading ? "Checkout in corso..." : "Procedi al checkout"}
            </button>
            <button
              type="button"
              onClick={clearCart}
              className="w-full text-xs font-semibold text-slate-400 hover:text-[#a41f2e]"
            >
              Svuota carrello
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
