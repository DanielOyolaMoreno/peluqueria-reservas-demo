import { NextResponse } from "next/server";
import { getBookingsByDate, createBooking, deleteBooking } from "@/services/booking.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date"); // YYYY-MM-DD
  
  if (!date) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  }

  try {
    const bookings = await getBookingsByDate(date);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET /api/bookings Error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Debes iniciar sesión para reservar." }, { status: 401 });
    }

    const body = await request.json();
    const { date, service } = body;
    const userId = (session.user as any).id;

    if (!date || !service) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const booking = await createBooking({ date, service, userId });
    
    // Convertir el string ISO al objeto Date para un formateo limpio
    const fecha = new Date(booking.date);
    const fechaFormateada = format(fecha, "PPPP 'a las' HH:mm", { locale: es });

    // Enviar correo de confirmación de reserva
    if (session.user.email) {
      sendEmail({
        to: session.user.email,
        subject: "Confirmación de cita - Peluquería",
        html: `
          <h2>¡Cita Confirmada!</h2>
          <p>Hola ${session.user.name},</p>
          <p>Tu cita para <strong>${booking.service}</strong> ha sido reservada correctamente para el <strong>${fechaFormateada}</strong>.</p>
          <p>¡Te esperamos!</p>
        `,
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/bookings Error:", error);
    
    if (error.message === "This time slot is already booked") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Debes iniciar sesión para eliminar." }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // Buscamos la reserva para poder sacar la fecha para el correo
    const { prisma } = await import("@/lib/prisma");
    const bookingToDelete = await prisma.booking.findUnique({
      where: { id }
    });

    await deleteBooking(id, (session.user as any).id);

    // Enviar correo de cancelación
    if (session.user.email && bookingToDelete) {
      const fecha = new Date(bookingToDelete.date);
      const fechaFormateada = format(fecha, "PPPP 'a las' HH:mm", { locale: es });
      
      sendEmail({
        to: session.user.email,
        subject: "Cancelación de cita - Peluquería",
        html: `
          <h2>Cita Cancelada</h2>
          <p>Hola ${session.user.name},</p>
          <p>Te confirmamos que hemos cancelado tu cita de <strong>${bookingToDelete.service}</strong> para el <strong>${fechaFormateada}</strong>.</p>
          <p>Esperamos verte pronto.</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/bookings Error:", error);
    if (error.message === "Booking not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error.message === "Not authorized to delete this booking") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete booking" }, { status: 500 });
  }
}


