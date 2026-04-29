"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Modal } from "@/components";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLogout = () => {
        signOut({ callbackUrl: "/" });
    };

    return (
        <>
        <Modal 
            isOpen={isModalOpen}
            title="Cerrar sesión"
            message="¿Estás seguro de que deseas salir de tu cuenta?"
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleLogout}
            confirmText="Sí, salir"
            cancelText="Cancelar"
        />
        <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="font-bold text-xl tracking-tight">Peluquería</span>
                    </Link>
                    <nav className="hidden md:flex gap-6">
                        <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Inicio
                        </Link>
                        <Link href="/reservas" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Reservas
                        </Link>
                    </nav>
                </div>
                
                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium hidden sm:inline-block">
                                Hola, <span className="text-muted-foreground">{session.user?.name}</span>
                            </span>
                            {(session.user as any)?.role === "ADMIN" && (
                                <Link href="/admin">
                                    <Button variant="outline" size="sm" className="hidden sm:flex border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 max-h-8">
                                        Panel Admin
                                    </Button>
                                </Link>
                            )}
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setIsModalOpen(true)} 
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8"
                            >
                                Salir
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="emerald" size="sm">Registro</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
        </>
    )
}
