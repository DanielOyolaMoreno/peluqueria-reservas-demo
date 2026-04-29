"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, title: string, message: string, redirect: boolean}>({
    isOpen: false,
    title: "",
    message: "",
    redirect: false
  });

  const closeModal = () => {
    const shouldRedirect = modalConfig.redirect;
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
    if (shouldRedirect) {
      router.push("/login");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrarse");
      }

      setModalConfig({
        isOpen: true,
        title: "Registro exitoso",
        message: "Usuario registrado. Ya puedes iniciar sesión.",
        redirect: true
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <Modal 
        isOpen={modalConfig.isOpen} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        onClose={closeModal} 
      />
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Crear una cuenta</CardTitle>
            <CardDescription>
              Ingresa tus datos a continuación para registrarte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-4 bg-destructive/15 text-destructive p-3 rounded-md text-sm">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name"
                  type="text" 
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Juan Pérez"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@email.com"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full mt-2" variant="emerald">
                Registrarse
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <div>
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-500 font-medium hover:underline underline-offset-4">
                Inicia sesión
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}