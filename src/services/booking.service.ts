import { prisma } from "@/lib/prisma";

export async function getBookingsByDate(dateString: string) {
  // Establecer el inicio y fin del día
  const startDate = new Date(dateString);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateString);
  endDate.setHours(23, 59, 59, 999);

  return await prisma.booking.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true, // solo necesitamos la fecha para bloquear los horarios libres
    },
  });
}

export async function getAdminBookingsByDate(dateString: string) {
  // Establecer el inicio y fin del día
  const startDate = new Date(dateString);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateString);
  endDate.setHours(23, 59, 59, 999);

  return await prisma.booking.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  });
}

export type CreateBookingDTO = {
  date: string | Date;
  service: string;
  userId: string | number | any; // Any since prisma schema was not checked for userId type
};

export async function createBooking(data: CreateBookingDTO) {
  const bookingDate = new Date(data.date);

  // Validación básica: chequear si el horario ya está reservado
  const existingBooking = await prisma.booking.findFirst({
    where: {
      date: bookingDate,
    },
  });

  if (existingBooking) {
    throw new Error("This time slot is already booked");
  }

  // Crear la reserva
  const booking = await prisma.booking.create({
    data: {
      date: bookingDate,
      service: data.service,
      userId: data.userId,
    },
  });

  return booking;
}

export async function getBookingsByUser(userId: string | number) {
  return await prisma.booking.findMany({
    where: { userId: Number(userId) },
    orderBy: { date: "asc" },
    select: {
      id: true,
      date: true,
      service: true,
    },
  });
}

export async function deleteBooking(id: string | number, userId: string | number) {
  const booking = await prisma.booking.findUnique({
    where: { id: Number(id) },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.userId !== Number(userId)) {
    throw new Error("Not authorized to delete this booking");
  }

  return await prisma.booking.delete({
    where: { id: Number(id) },
  });
}

