import { Navbar } from "@/components/navbar/Navbar";
import NextAuthProvider from "@/providers/NextAuthProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peluquería - Reservas Online",
  description: "Reserva tu cita en nuestra peluquería de forma rápida y sencilla.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <NextAuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
        </NextAuthProvider>
      </body>
    </html>
  );
}
