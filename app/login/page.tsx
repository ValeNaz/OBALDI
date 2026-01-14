"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const { login } = useUser();
  const router = useRouter();

  const handleLogin = (event: React.FormEvent, role: "ADMIN" | "SELLER" | "USER") => {
    event.preventDefault();
    login(email || "demo@obaldi.it", role);
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto py-32 px-4">
      <div className="bg-white p-10 rounded-2xl border shadow-sm text-center">
        <h1 className="text-3xl font-bold mb-8 text-[#0b224e]">Accedi a Obaldi</h1>
        <form className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-3 border rounded-lg"
              placeholder="Inserisci la tua email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 pt-4">
            <button onClick={(event) => handleLogin(event, "USER")} className="w-full py-3 bg-[#0b224e] text-white rounded font-bold">
              Accedi come Membro
            </button>
            <button onClick={(event) => handleLogin(event, "ADMIN")} className="w-full py-3 border border-slate-200 rounded font-bold text-slate-600">
              Accedi come Admin
            </button>
            <button onClick={(event) => handleLogin(event, "SELLER")} className="w-full py-3 border border-slate-200 rounded font-bold text-slate-600">
              Accedi come Seller
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
