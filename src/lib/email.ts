import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Mismo servicio proporcionado
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Contraseña de aplicación
  },
});

export const sendEmail = async ({ to, subject, html }: { to: string, subject: string, html: string }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("No se han configurado las credenciales de email. El correo no se envió.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Peluquería" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email enviado a ${to} sobre: ${subject}`);
  } catch (error) {
    console.error("Error enviando email:", error);
  }
};
