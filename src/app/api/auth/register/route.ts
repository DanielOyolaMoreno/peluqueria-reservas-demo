import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "El correo ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Enviar email de bienvenida de forma asíncrona (sin bloquear al usuario)
    if (user.email) {
      sendEmail({
        to: user.email,
        subject: "¡Bienvenid@ a nuestra Peluquería!",
        html: `<h2>Hola ${name}</h2><p>Gracias por registrarte con nosotros. Ya puedes acceder a hacer tus reservas en nuestra plataforma web.</p>`
      });
    }

    return NextResponse.json({ message: "Usuario creado exitosamente", user: { id: user.id, email: user.email } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
