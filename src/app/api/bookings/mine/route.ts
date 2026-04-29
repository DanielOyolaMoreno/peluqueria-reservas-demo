import { NextResponse } from "next/server";
import { getBookingsByUser } from "@/services/booking.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // @ts-ignore - session.user is extended in options but TS might not pick it up correctly
    const bookings = await getBookingsByUser((session.user as any).id);
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET /api/bookings/mine Error:", error);
    return NextResponse.json({ error: "Failed to fetch user bookings" }, { status: 500 });
  }
}
