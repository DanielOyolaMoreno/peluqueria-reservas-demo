"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push("/reservas"); // o a donde prefieras redirigir tras loguear
      router.refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow text-black">
      <h1 className="text-2xl font-bold mb-4">Iniciar Sesión</h1>
      
      {error && <div className="mb-4 bg-red-100 text-red-600 p-3 rounded">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-black">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white" 
            placeholder="Tu correo electrónico" 
            required 
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-black">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 bg-white" 
            placeholder="Tu contraseña" 
            required 
          />
        </div>
        <div className="flex flex-col items-center space-y-4 pt-2">
          <button type="submit" className="w-full bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition">
            Iniciar Sesión
          </button>
          
          <div className="flex flex-col items-center space-y-2">
            <Link href="/forgot-password" className="text-sm text-emerald-500 hover:text-emerald-700 transition">
              ¿Olvidaste tu contraseña?
            </Link>
            <Link href="/register" className="text-sm text-emerald-500 hover:text-emerald-700 transition">
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}