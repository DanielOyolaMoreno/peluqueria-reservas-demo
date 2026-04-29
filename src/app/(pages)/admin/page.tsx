"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Booking = {
  id: number;
  date: string;
  service: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/bookings?date=${selectedDate}`);
        if (!response.ok) {
          throw new Error("Error al obtener las reservas");
        }
        const data = await response.json();
        setBookings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      fetchBookings();
    }
  }, [selectedDate, status, session]);

  if (status === "loading" || loading) {
    return <div className="flex h-[80vh] items-center justify-center"><div className="animate-pulse text-muted-foreground text-lg">Cargando panel de administrador...</div></div>;
  }

  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
    return null; // Redireccionando
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 shadow-none">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona las reservas de los clientes y visualiza los horarios ocupados.</p>
        </div>
        
        <div className="bg-secondary/50 p-4 rounded-xl border flex items-center gap-4 w-full md:w-auto">
          <Label className="whitespace-nowrap font-semibold">Seleccionar Fecha:</Label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-48 bg-background"
          />
        </div>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {error ? (
             <div className="p-8 text-center text-destructive bg-destructive/10">
               {error}
             </div>
          ) : bookings.length === 0 ? (
            <div className="p-16 text-center text-muted-foreground flex flex-col items-center gap-2">
              <p className="text-lg font-medium">No hay reservas para esta fecha</p>
              <p className="text-sm">Selecciona otra fecha en el calendario superior para ver más resultados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground border-b text-xs uppercase font-semibold">
                  <tr>
                    <th scope="col" className="px-6 py-4">Hora</th>
                    <th scope="col" className="px-6 py-4">Cliente</th>
                    <th scope="col" className="px-6 py-4">Correo</th>
                    <th scope="col" className="px-6 py-4">Teléfono</th>
                    <th scope="col" className="px-6 py-4">Servicio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 bg-card">
                  {bookings.map((booking) => {
                    const bookingDate = new Date(booking.date);
                    const time = format(bookingDate, "HH:mm");
                    
                    return (
                      <tr key={booking.id} className="hover:bg-muted/50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground bg-emerald-50/50 group-hover:bg-emerald-50 dark:bg-emerald-900/10 dark:group-hover:bg-emerald-800/40 w-24 text-center">
                          {time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.user.name || "Sin nombre"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{booking.user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{booking.user.phone || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border">
                            {booking.service}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
