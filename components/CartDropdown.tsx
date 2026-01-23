"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";

type CartDropdownProps = {
  buttonClassName?: string;
};

const CartDropdown = ({ buttonClassName = "" }: CartDropdownProps) => {
  const { user } = useUser();
  const { items, itemCount, updateQty, removeItem, clearCart } = useCart();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  const pathname = usePathname();

  const totals = useMemo(() => {
    const totalCents = items.reduce((sum, item) => sum + item.priceCents * item.qty, 0);
    const pointsCap = items.reduce((sum, item) => {
      if (!item.pointsEligible || !item.pointsPrice) return sum;
      const maxByPrice = Math.floor(item.priceCents / 100);
      const maxByProduct = item.pointsPrice;
      const perUnit = Math.min(maxByPrice, maxByProduct);
      return sum + perUnit * item.qty;
    }, 0);
    return { totalCents, pointsCap };
  }, [items]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`relative inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-[#0b224e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b224e]/30 ${buttonClassName}`}
      >
        Carrello
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#a41f2e] text-[10px] font-bold text-white flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      <div
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-label="Carrello"
        tabIndex={-1}
        className={`absolute right-0 mt-3 w-[320px] origin-top-right rounded-2xl border border-white/60 bg-white/95 p-4 shadow-xl backdrop-blur transition duration-200 ${
          open ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#0b224e]">Carrello</h3>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-[11px] font-semibold text-slate-400 hover:text-[#a41f2e]"
            >
              Svuota
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="text-sm text-slate-500 space-y-3">
            <div>Nessun prodotto nel carrello.</div>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center w-full rounded-full bg-[#0b224e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a3a6e]"
            >
              Vai al marketplace
            </Link>
          </div>
        ) : (
          <>
            <div className="max-h-64 space-y-3 overflow-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/60 bg-white">
                    <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#0b224e] line-clamp-2">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      €{(item.priceCents / 100).toFixed(2)} x {item.qty}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Punti: {item.pointsEligible && item.pointsPrice ? `fino a ${item.pointsPrice}` : "non disponibili"}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-[#a41f2e]"
                      aria-label={`Rimuovi ${item.title}`}
                    >
                      Rimuovi
                    </button>
                    <div className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, Math.max(1, item.qty - 1))}
                        className="h-5 w-5 rounded-full bg-white text-[10px] font-bold text-slate-600"
                        aria-label="Riduci quantita"
                      >
                        -
                      </button>
                      <span className="text-[11px] font-semibold text-slate-700">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="h-5 w-5 rounded-full bg-white text-[10px] font-bold text-slate-600"
                        aria-label="Aumenta quantita"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-3 border-t border-slate-200 pt-4">
              <div className="flex justify-between text-sm font-semibold text-[#0b224e]">
                <span>Totale</span>
                <span>€{(totals.totalCents / 100).toFixed(2)}</span>
              </div>
              {totals.pointsCap > 0 && (
                <div className="text-xs text-slate-500">
                  Punti applicabili: {totals.pointsCap}
                </div>
              )}
              {!user?.isMember && (
                <Link
                  href="/membership"
                  className="inline-flex items-center justify-center w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#0b224e] hover:bg-white/80"
                >
                  Registrati per acquistare
                </Link>
              )}
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center w-full rounded-full bg-[#0b224e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a3a6e]"
              >
                Vai al checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDropdown;
