"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProfileData = {
  user: {
    id: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    bio: string | null;
  };
  membership: {
    status: string;
    planCode: string;
    currentPeriodEnd: string;
    autoRenew: boolean;
  } | null;
  pointsBalance: number;
};

type PurchaseAssistRequest = {
  id: string;
  urlToCheck: string;
  notes: string | null;
  status: "OPEN" | "IN_REVIEW" | "DONE";
  outcome: string | null;
  createdAt: string;
};

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [assistRequests, setAssistRequests] = useState<PurchaseAssistRequest[]>([]);
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistError, setAssistError] = useState<string | null>(null);
  const [assistUrl, setAssistUrl] = useState("");
  const [assistNotes, setAssistNotes] = useState("");
  const [assistSubmitting, setAssistSubmitting] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/me/wishlist");
      const data = await res.json();
      setWishlistItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setWishlistItems(prev => prev.filter(i => i.productId !== productId));
      await fetch(`/api/me/wishlist?productId=${productId}`, { method: "DELETE" });
    } catch {
      fetchWishlist(); // Revert on error
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    if (window.location.hash === "#wishlist") {
      setTimeout(() => {
        document.getElementById("wishlist")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [wishlistLoading]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/me", {
          credentials: "include"
        });
        if (!response.ok) {
          setError("Sessione non valida. Accedi di nuovo.");
          return;
        }
        const payload = await response.json();
        setData(payload);
        setFirstName(payload.user.firstName || "");
        setLastName(payload.user.lastName || "");
        setPhone(payload.user.phone || "");
        setBio(payload.user.bio || "");
      } catch {
        setError("Impossibile caricare il profilo.");
      }
    };

    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setAssistLoading(true);
        const response = await fetch("/api/purchase-assist", {
          credentials: "include"
        });
        if (!response.ok) {
          return;
        }
        const payload = await response.json();
        setAssistRequests(payload.requests ?? []);
      } catch {
        // Ignore errors for non-premium users.
      } finally {
        setAssistLoading(false);
      }
    };

    load();
  }, []);

  if (error) {
    return (
      <div className="container-max page-pad pt-28 md:pt-32 pb-20">
        <div className="glass-panel p-8 text-center">
          <p className="text-sm text-slate-600">{error}</p>
          <Link href="/login" className="mt-4 inline-block text-sm font-bold text-[#0b224e]">
            Vai al login
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-max page-pad pt-28 md:pt-32 pb-20">
        <div className="glass-panel p-8 text-center text-slate-500">Caricamento profilo...</div>
      </div>
    );
  }

  const membership = data.membership;

  const handleProfileSave = async () => {
    setProfileError(null);
    setProfileSuccess(null);
    setProfileSaving(true);
    try {
      const response = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          bio
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setProfileError(payload?.error?.message ?? "Impossibile aggiornare il profilo.");
        return;
      }
      setProfileSuccess("Profilo aggiornato con successo.");
      setData(prev => prev ? { ...prev, user: { ...prev.user, firstName, lastName, phone, bio } } : null);
    } catch {
      setProfileError("Errore di connessione.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!passwordNew || passwordNew.length < 8) {
      setPasswordError("La nuova password deve avere almeno 8 caratteri.");
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setPasswordError("Le password non coincidono.");
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordCurrent || undefined,
          newPassword: passwordNew
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setPasswordError(payload?.error?.message ?? "Impossibile aggiornare la password.");
        return;
      }
      setPasswordSuccess("Password aggiornata con successo.");
      setPasswordCurrent("");
      setPasswordNew("");
      setPasswordConfirm("");
    } catch {
      setPasswordError("Impossibile aggiornare la password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAssistSubmit = async () => {
    if (!assistUrl.trim()) {
      setAssistError("Inserisci un URL valido.");
      return;
    }
    setAssistSubmitting(true);
    setAssistError(null);
    try {
      const response = await fetch("/api/purchase-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlToCheck: assistUrl.trim(),
          notes: assistNotes.trim() || undefined
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setAssistError(payload?.error?.message ?? "Impossibile inviare la richiesta.");
        return;
      }
      setAssistRequests((prev) => [payload.request, ...prev]);
      setAssistUrl("");
      setAssistNotes("");
    } catch {
      setAssistError("Impossibile inviare la richiesta.");
    } finally {
      setAssistSubmitting(false);
    }
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Area Riservata</h1>
        <p className="text-slate-500 mt-2">Gestisci la tua membership e i punti Obaldi.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="glass-card card-pad lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#0b224e]">Informazioni Personali</h2>
            <button
              onClick={handleProfileSave}
              disabled={profileSaving}
              className="text-sm font-bold text-[#0b224e] hover:underline disabled:opacity-50"
            >
              {profileSaving ? "Salvataggio..." : "Salva modifiche"}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Nome</label>
              <input
                type="text"
                className="glass-input w-full py-2"
                placeholder="Il tuo nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Cognome</label>
              <input
                type="text"
                className="glass-input w-full py-2"
                placeholder="Il tuo cognome"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Telefono</label>
              <input
                type="tel"
                className="glass-input w-full py-2"
                placeholder="+39..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Email (Non modificabile)</label>
              <input
                disabled
                type="email"
                className="glass-input w-full py-2 opacity-50 cursor-not-allowed"
                value={data.user.email}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Biografia / Note</label>
              <textarea
                rows={3}
                className="glass-input w-full py-2"
                placeholder="Qualcosa su di te..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          {profileError && (
            <div className="mt-4 text-xs text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="mt-4 text-xs text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-2">
              {profileSuccess}
            </div>
          )}
        </div>

        <div className="glass-card card-pad">
          <h2 className="text-xl font-bold text-[#0b224e] mb-4">Punti</h2>
          <div className="text-4xl font-black text-[#0b224e]">{data.pointsBalance}</div>
          <p className="text-xs text-slate-400 mt-2">Saldo punti disponibili</p>
        </div>

        <div className="glass-card card-pad">
          <h2 className="text-xl font-bold text-[#0b224e] mb-4">Ordini</h2>
          <p className="text-sm text-slate-500 mb-4">
            Visualizza lo storico dei tuoi acquisti e lo stato di ogni ordine.
          </p>
          <Link href="/orders" className="inline-flex text-sm font-bold text-[#0b224e]">
            Vai agli ordini →
          </Link>
        </div>

        <div className="glass-card card-pad">
          <h2 className="text-xl font-bold text-[#0b224e] mb-4">Messaggi</h2>
          <p className="text-sm text-slate-500 mb-4">
            Contatta il supporto o visualizza le tue segnalazioni attive.
          </p>
          <Link href="/profile/chat" className="inline-flex text-sm font-bold text-[#0b224e]">
            Vai ai messaggi →
          </Link>
        </div>

        <div className="glass-card card-pad lg:col-span-2">
          <h2 className="text-xl font-bold text-[#0b224e] mb-4">Sicurezza</h2>
          <p className="text-sm text-slate-500 mb-6">
            Se e&apos; il tuo primo accesso, lascia vuota la password attuale.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password attuale</label>
              <input
                type="password"
                className="glass-input w-full"
                placeholder="Inserisci la password attuale"
                value={passwordCurrent}
                onChange={(event) => setPasswordCurrent(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nuova password</label>
              <input
                type="password"
                className="glass-input w-full"
                placeholder="Minimo 8 caratteri"
                value={passwordNew}
                onChange={(event) => setPasswordNew(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Conferma password</label>
              <input
                type="password"
                className="glass-input w-full"
                placeholder="Ripeti la nuova password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handlePasswordSave}
                disabled={passwordLoading}
                className="w-full py-3 bg-[#0b224e] text-white rounded-full font-bold hover:shadow-glow-soft transition"
              >
                {passwordLoading ? "Salvataggio..." : "Aggiorna password"}
              </button>
            </div>
          </div>
          {passwordError && (
            <div className="mt-4 text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mt-4 text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              {passwordSuccess}
            </div>
          )}
        </div>

        <div className="glass-card card-pad lg:col-span-3">
          <h2 className="text-xl font-bold text-[#0b224e] mb-4">Membership</h2>
          {membership ? (
            <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-600">
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400">Piano</span>
                <p className="font-semibold text-slate-700">{membership.planCode}</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400">Status</span>
                <p className="font-semibold text-slate-700">{membership.status}</p>
              </div>
              <div>
                <span className="text-xs uppercase tracking-widest text-slate-400">Scadenza</span>
                <p className="font-semibold text-slate-700">
                  {new Date(membership.currentPeriodEnd).toLocaleDateString("it-IT")}
                </p>
              </div>
              <div className="md:col-span-3">
                <span className="text-xs uppercase tracking-widest text-slate-400">Auto-rinnovo</span>
                <p className="font-semibold text-slate-700">
                  {membership.autoRenew ? "Attivo" : "Disattivato"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Nessuna membership attiva.</p>
          )}
        </div>

        <div className="glass-card card-pad lg:col-span-3">
          <h2 className="text-xl font-bold text-[#0b224e] mb-4">Assistenza acquisti (Tutela)</h2>
          {membership?.planCode === "TUTELA" ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">URL da verificare</label>
                  <input
                    type="url"
                    className="glass-input w-full"
                    placeholder="https://..."
                    value={assistUrl}
                    onChange={(event) => setAssistUrl(event.target.value)}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Note (opzionali)</label>
                  <textarea
                    rows={3}
                    className="glass-input w-full"
                    placeholder="Dettagli utili per la verifica"
                    value={assistNotes}
                    onChange={(event) => setAssistNotes(event.target.value)}
                  />
                </div>
              </div>
              {assistError && (
                <div className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {assistError}
                </div>
              )}
              <button
                onClick={handleAssistSubmit}
                disabled={assistSubmitting}
                className="py-3 px-8 bg-[#0b224e] text-white rounded-full font-bold hover:shadow-glow-soft transition"
              >
                {assistSubmitting ? "Invio in corso..." : "Invia richiesta"}
              </button>
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Richieste inviate</h3>
                {assistLoading ? (
                  <p className="text-sm text-slate-500">Caricamento richieste...</p>
                ) : assistRequests.length === 0 ? (
                  <p className="text-sm text-slate-500">Nessuna richiesta ancora inviata.</p>
                ) : (
                  <div className="space-y-3 text-sm">
                    {assistRequests.map((request) => (
                      <div key={request.id} className="glass-panel p-4">
                        <div className="flex flex-wrap gap-2 justify-between">
                          <span className="font-semibold text-[#0b224e]">{request.urlToCheck}</span>
                          <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                            {request.status === "OPEN"
                              ? "Aperta"
                              : request.status === "IN_REVIEW"
                                ? "In revisione"
                                : "Completata"}
                          </span>
                        </div>
                        {request.outcome && (
                          <p className="text-xs text-slate-500 mt-2">Esito: {request.outcome}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              La verifica degli acquisti è disponibile solo per i membri Tutela.
              <div className="mt-4">
                <Link href="/membership" className="text-sm font-bold text-[#0b224e]">
                  Passa a Tutela →
                </Link>
              </div>
            </div>
          )}
        </div>
        <div className="glass-card card-pad lg:col-span-3" id="wishlist">
          <h2 className="text-xl font-bold text-[#0b224e] mb-4">Lista Desideri</h2>
          {wishlistLoading ? (
            <p className="text-sm text-slate-500">Caricamento preferiti...</p>
          ) : wishlistItems.length === 0 ? (
            <p className="text-sm text-slate-500">
              Non hai ancora salvato nessun prodotto.{" "}
              <Link href="/marketplace" className="text-[#0b224e] font-bold hover:underline">
                Vai al Marketplace
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {wishlistItems.map((item) => (
                <div key={item.id} className="relative group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <Link href={`/product/${item.product.id}`} className="block">
                    <div className="aspect-[4/3] relative bg-slate-50">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          No Image
                        </div>
                      )}
                      {item.product.isOutOfStock && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">Esaurito</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-[#0b224e] text-sm truncate">{item.product.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 font-semibold">
                        €{(item.product.priceCents / 100).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition shadow-sm opacity-0 group-hover:opacity-100"
                    title="Rimuovi dai preferiti"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
