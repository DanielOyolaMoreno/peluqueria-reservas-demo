"use client";

import { useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Modal } from "@/components";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const BUSINESS_HOURS = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export default function ReservasPage() {
  const { data: session, status } = useSession();
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({ isOpen: false, title: "", message: "" });
  const openModal = (title: string, message: string, onConfirm?: () => void, confirmText?: string) => 
    setModalConfig({ isOpen: true, title, message, onConfirm, confirmText });
  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  const [service, setService] = useState("Corte de Pelo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [myBookings, setMyBookings] = useState<any[]>([]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => {
    const prev = subMonths(currentDate, 1);
    if (!isBefore(endOfMonth(prev), startOfToday())) {
      setCurrentDate(prev);
    }
  };

  useEffect(() => {
    if (!selectedDate) return;
    
    const fetchBookings = async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      try {
        const response = await fetch(`/api/bookings?date=${dateStr}`);
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        
        const bookedTimeStrings = data.map((b: any) => format(new Date(b.date), "HH:mm"));
        setBookedSlots(bookedTimeStrings);
      } catch (error) {
        console.error(error);
      }
    };
    
    fetchBookings();
    setSelectedTime(null);
    setSuccessMsg("");
  }, [selectedDate]);

  const fetchMyBookings = async () => {
    if (!session) return;
    try {
      const res = await fetch(`/api/bookings/mine`);
      if (!res.ok) return;
      const data = await res.json();
      setMyBookings(data);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
    }
  };

  useEffect(() => {
    if (session) fetchMyBookings();
    else setMyBookings([]);
  }, [session]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      openModal("Atención", "Debes iniciar sesión para reservar");
      return;
    }
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    
    const bookingDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":");
    bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: bookingDateTime.toISOString(),
          service,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        openModal("Error", err.error || "Error al reservar");
        return;
      }

      setSuccessMsg(`¡Reserva confirmada para el ${format(bookingDateTime, "dd/MM/yyyy HH:mm")}!`);
      setBookedSlots(prev => [...prev, selectedTime]);
      setSelectedTime(null);
      fetchMyBookings();
      
    } catch (error) {
      openModal("Error", "Error al conectar con el servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string) => {
    openModal(
      "Cancelar reserva",
      "¿Estás seguro de que deseas cancelar esta reserva?",
      () => handleDelete(id),
      "Sí, cancelar"
    );
  };

  const handleDelete = async (id: string) => {
    closeModal();
    const bookingToDelete = myBookings.find(b => b.id === id);

    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        openModal("Error", err.error || "Error al eliminar reserva");
        return;
      }

      setMyBookings(prev => prev.filter(b => b.id !== id));

      if (bookingToDelete && selectedDate) {
        const dateObj = new Date(bookingToDelete.date);
        if (format(dateObj, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")) {
          const timeStr = format(dateObj, "HH:mm");
          setBookedSlots(prev => prev.filter(t => t !== timeStr));
        }
      }
    } catch (error) {
      console.error(error);
      openModal("Error", "Error de conexión al eliminar reserva");
    }
  };

  if (status === "loading") return <div className="flex h-[80vh] items-center justify-center"><div className="animate-pulse text-muted-foreground">Cargando...</div></div>;

  return (
    <>
      <Modal 
        isOpen={modalConfig.isOpen} 
        title={modalConfig.title} 
        message={modalConfig.message} 
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        confirmText={modalConfig.confirmText}
      />
      <div className="flex flex-col items-center min-h-[90vh] py-10 px-4 bg-secondary/20">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">Reserva tu cita</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Selecciona el día y la hora. Las horas marcadas en gris ya han sido reservadas.
          </p>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-6 w-full max-w-6xl items-start">
          
          {/* CALENDAR SECTION */}
          <Card className="flex-1 w-full border-zinc-200/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 rounded-full">
                &larr;
              </Button>
              <CardTitle className="capitalize text-lg font-semibold tracking-wide">
                {format(currentDate, "MMMM yyyy", { locale: es })}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full">
                &rarr;
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center text-sm mb-4 text-muted-foreground font-medium">
                {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map(day => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                
                {daysInMonth.map((day) => {
                  const isPast = isBefore(day, startOfToday());
                  const isSelected = selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                  const today = isToday(day);

                  return (
                    <button
                      key={day.toString()}
                      disabled={isPast}
                      onClick={() => setSelectedDate(day)}
                      className={`h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm transition-all
                        ${isPast ? "text-muted opacity-50 cursor-not-allowed" : "hover:bg-emerald-50 hover:text-emerald-700"}
                        ${isSelected ? "bg-emerald-600 text-white font-medium shadow-md hover:bg-emerald-700" : ""}
                        ${today && !isSelected ? "border border-emerald-500 text-emerald-600 font-bold" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* TIME & FORM SECTION */}
          <Card className="flex-1 w-full border-zinc-200/60 shadow-sm flex flex-col min-h-[400px]">
            <CardContent className="pt-6 flex-1 flex flex-col">
              {!selectedDate ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                  <span className="text-4xl opacity-20 mb-2">📅</span>
                  <p>Por favor, selecciona un día en el calendario primero.</p>
                </div>
              ) : (
                <>
                  <div className="mb-6 pb-4 border-b">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-emerald-600">🕘</span>
                      Horarios para el {format(selectedDate, "d 'de' MMMM", { locale: es })}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {BUSINESS_HOURS.map((time) => {
                      const isBooked = bookedSlots.includes(time);
                      
                      const [hours, minutes] = time.split(":").map(Number);
                      const isPast = isToday(selectedDate) && (new Date().getHours() > hours || (new Date().getHours() === hours && new Date().getMinutes() >= minutes));
                      
                      const isDisabled = isBooked || isPast;
                      const isSelectedTime = time === selectedTime;
                      
                      return (
                        <button
                          key={time}
                          disabled={isDisabled}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2.5 rounded-md text-sm font-medium transition-all duration-200 border
                            ${isDisabled ? "bg-muted/50 text-muted-foreground/50 border-transparent cursor-not-allowed line-through" : ""}
                            ${!isDisabled && !isSelectedTime ? "bg-background text-foreground border-input hover:border-emerald-500 hover:text-emerald-600" : ""}
                            ${isSelectedTime ? "bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-600 ring-offset-2 ring-offset-background" : ""}
                          `}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>

                  {selectedTime && (
                    <form onSubmit={handleBooking} className="flex flex-col gap-4 mt-auto">
                      {successMsg && (
                        <div className="p-3 bg-emerald-50/50 border border-emerald-200 text-emerald-800 rounded-md text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
                          ✓ {successMsg}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label>Servicio</Label>
                        <select 
                          value={service} 
                          onChange={e => setService(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="Corte de Pelo">Corte de Pelo - </option>
                          <option value="Coloración y Mechas">Coloración - </option>
                          <option value="Tratamientos">Tratamientos - </option>
                        </select>
                      </div>

                      {!session ? (
                        <div className="text-sm text-destructive border border-destructive/20 bg-destructive/10 p-3 rounded-md mb-2 flex items-center justify-between">
                          <span>Inicia sesión para confirmar tu cita.</span>
                          <Link href="/login">
                            <Button variant="outline" size="sm" className="h-8">Login</Button>
                          </Link>
                        </div>
                      ) : (
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          variant="emerald"
                          className="w-full mt-2"
                        >
                          {isSubmitting ? "Confirmando..." : `Confirmar Cita a las ${selectedTime}`}
                        </Button>
                      )}
                    </form>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* MY BOOKINGS SECTION */}
          <Card className="w-full xl:w-80 border-zinc-200/60 shadow-sm shrink-0">
            <CardHeader className="pb-3 border-b mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-primary">🗓</span>
                Mis Reservas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!session ? (
                <div className="text-sm text-muted-foreground text-center py-6">
                  Inicia sesión para ver tus reservas.
                </div>
              ) : (
                <div className="space-y-4">
                  {myBookings.length === 0 ? (
                    <div className="text-sm text-muted-foreground text-center py-6">
                      No tienes reservas vigentes.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {myBookings.map((b: any) => {
                        const dateObj = new Date(b.date);
                        return (
                          <li key={b.id} className="p-3 bg-secondary/30 border rounded-lg group hover:border-border transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-sm">{format(dateObj, "dd MMM yyyy", {locale: es})}</p>
                                <p className="text-xs text-muted-foreground">{format(dateObj, "HH:mm")} hs</p>
                              </div>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => confirmDelete(b.id)}
                                title="Cancelar reserva"
                              >
                                &times;
                              </Button>
                            </div>
                            <p className="text-xs font-medium px-2 py-1 bg-background rounded inline-block border">
                              {b.service}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}
