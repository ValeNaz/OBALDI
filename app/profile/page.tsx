"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProfileData = {
  user: {
    id: string;
    email: string;
    role: string;
  };
  membership: {
    status: string;
    planCode: string;
    currentPeriodEnd: string;
    autoRenew: boolean;
  } | null;
  pointsBalance: number;
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

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch("/api/me", { signal: controller.signal });
        if (!response.ok) {
          setError("Sessione non valida. Accedi di nuovo.");
          return;
        }
        const payload = await response.json();
        setData(payload);
      } catch {
        setError("Impossibile caricare il profilo.");
      }
    };

    load();
    return () => controller.abort();
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

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-[#0b224e]">Area Riservata</h1>
        <p className="text-slate-500 mt-2">Gestisci la tua membership e i punti Obaldi.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="glass-card card-pad lg:col-span-2">
          <h2 className="text-xl font-bold text-[#0b224e] mb-4">Profilo</h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400">Email</span>
              <p className="font-semibold text-slate-700">{data.user.email}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400">Ruolo</span>
              <p className="font-semibold text-slate-700">{data.user.role}</p>
            </div>
          </div>
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
      </div>
    </div>
  );
}
