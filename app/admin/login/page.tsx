"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("error");
    if (errorCode === "FORBIDDEN") {
      setError("Accesso non consentito.");
    } else if (errorCode === "UNAUTHORIZED") {
      setError("Accedi per continuare.");
    }
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Inserisci email e password.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setError(payload?.error?.message ?? "Credenziali non valide.");
        return;
      }
      if (payload?.user?.role !== "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST" });
        setError("Il profilo non ha permessi admin.");
        return;
      }
      router.push("/admin");
    } catch {
      setError("Credenziali non valide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="max-w-lg mx-auto glass-card card-pad animate-fade-up">
        <h1 className="text-3xl font-display font-bold mb-3 text-[#0b224e]">
          Accesso Admin
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Inserisci le credenziali admin per accedere al pannello.
        </p>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="text-left">
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              className="glass-input w-full"
              placeholder="admin@tuodominio.it"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="text-left">
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              className="glass-input w-full"
              placeholder="Inserisci la password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 bg-[#0b224e] text-white rounded-full font-bold hover:shadow-glow-soft transition"
            disabled={loading}
          >
            {loading ? "Accesso..." : "Accedi"}
          </button>
        </form>
        <div className="text-center text-sm text-slate-500 mt-6">
          <Link href="/login" className="font-bold text-[#0b224e]">
            Torna al login generale
          </Link>
        </div>
      </div>
    </div>
  );
}
