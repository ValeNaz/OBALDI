"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  const [email, setEmail] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setError("Inserisci un'email valida.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message ?? "Impossibile inviare la richiesta.");
        return;
      }
      setSuccess("Se l'email e' corretta, riceverai un link di reset.");
    } catch {
      setError("Impossibile inviare la richiesta.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    setSuccess(null);
    if (!passwordNew || passwordNew.length < 8) {
      setError("La nuova password deve avere almeno 8 caratteri.");
      return;
    }
    if (passwordNew !== passwordConfirm) {
      setError("Le password non coincidono.");
      return;
    }
    if (!token) {
      setError("Token mancante.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: passwordNew })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message ?? "Impossibile reimpostare la password.");
        return;
      }
      setSuccess("Password aggiornata. Ora puoi accedere.");
      setPasswordNew("");
      setPasswordConfirm("");
    } catch {
      setError("Impossibile reimpostare la password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="glass-card card-pad max-w-lg mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold text-[#0b224e]">
          Reimposta password
        </h1>

        {token ? (
          <>
            <p className="text-sm text-slate-500">
              Inserisci la nuova password per completare il reset.
            </p>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nuova password</label>
              <input
                type="password"
                className="glass-input w-full"
                value={passwordNew}
                onChange={(event) => setPasswordNew(event.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Conferma password</label>
              <input
                type="password"
                className="glass-input w-full"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
              />
            </div>
            <button
              onClick={handleReset}
              disabled={loading}
              className="w-full py-3 bg-[#0b224e] text-white rounded-full font-bold hover:shadow-glow-soft transition"
            >
              {loading ? "Aggiornamento..." : "Aggiorna password"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-500">
              Inserisci la tua email. Ti invieremo un link per reimpostare la password.
            </p>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                className="glass-input w-full"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <button
              onClick={handleRequest}
              disabled={loading}
              className="w-full py-3 bg-[#0b224e] text-white rounded-full font-bold hover:shadow-glow-soft transition"
            >
              {loading ? "Invio..." : "Invia link di reset"}
            </button>
          </>
        )}

        {error && (
          <div className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-700 font-semibold bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        <div className="text-center text-sm text-slate-500">
          <Link href="/login" className="font-bold text-[#0b224e]">
            Torna al login
          </Link>
        </div>
      </div>
    </div>
  );
}
