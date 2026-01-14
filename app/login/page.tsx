"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useUser();
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("Inserisci email e password.");
      return;
    }
    const result = await login(email.trim(), password);
    if (!result.ok) {
      setError(result.error ?? "Accesso non riuscito.");
      return;
    }
    router.push("/");
  };

  return (
    <div className="container-max page-pad pt-28 md:pt-32 pb-20">
      <div className="max-w-lg mx-auto glass-card card-pad animate-fade-up">
        <h1 className="text-3xl font-display font-bold mb-3 text-[#0b224e]">Accedi a Obaldi</h1>
        <p className="text-sm text-slate-500 mb-8">
          Area protetta per membri, seller e amministratori.
        </p>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="text-left">
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              className="glass-input w-full"
              placeholder="Inserisci la tua email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="text-left">
            <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              className="glass-input w-full"
              placeholder="Inserisci la tua password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#0b224e] text-white rounded-full font-bold hover:shadow-glow-soft transition"
            >
              Accedi
            </button>
            <Link
              href="/reset-password"
              className="text-center text-sm font-bold text-[#0b224e] hover:opacity-80"
            >
              Password dimenticata?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
