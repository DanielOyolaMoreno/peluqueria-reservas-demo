import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center w-full min-h-screen">
      {/* Hero Section */}
      <section className="w-full bg-primary text-primary-foreground flex flex-col items-center justify-center py-24 px-4 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 sm:text-6xl text-black">
          Tu estilo, tu momento
        </h1>
        <p className="text-xl max-w-2xl text-black mb-8 leading-relaxed">
          Reserva fácilmente tu cita en nuestra peluquería. Expertos en cortes, coloración y cuidado del cabello.
        </p>
        <Link href="/reservas" passHref>
          <Button size="lg" variant="emerald" className="rounded-full text-lg px-8 h-14 font-semibold">
            Reservar Cita Ahora
          </Button>
        </Link>
      </section>

      {/* Servicios Section */}
      <section className="w-full max-w-6xl mx-auto py-20 px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Nuestros Servicios</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Descubre todo lo que podemos hacer por ti con las mejores técnicas y productos.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <Card className="hover:shadow-lg transition-all duration-300 border-zinc-200/60 break-inside-avoid shadow-sm group">
            <CardHeader className="text-center pt-16">
              <CardTitle className="text-xl">Corte de Pelo</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <CardDescription className="text-base mb-4">
                Cortes modernos y clásicos adaptados a tu estilo personal.
              </CardDescription>
              <p className="font-bold text-lg text-emerald-600">Desde $15</p>
            </CardContent>
          </Card>
          
          {/* Card 2 */}
          <Card className="hover:shadow-lg transition-all duration-300 border-zinc-200/60 break-inside-avoid shadow-sm group">
            <CardHeader className="text-center pt-16">
              <CardTitle className="text-xl">Coloración y Mechas</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <CardDescription className="text-base mb-4">
                Balayage, reflejos, tintes completos y fantasía.
              </CardDescription>
              <p className="font-bold text-lg text-emerald-600">Desde $35</p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="hover:shadow-lg transition-all duration-300 border-zinc-200/60 break-inside-avoid shadow-sm group">
            <CardHeader className="text-center pt-16">
              <CardTitle className="text-xl">Tratamientos</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <CardDescription className="text-base mb-4">
                Keratina, hidratación profunda y botox capilar.
              </CardDescription>
              <p className="font-bold text-lg text-emerald-600">Desde $40</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full bg-secondary/50 border-t py-10 text-center text-muted-foreground mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <p>© {new Date().getFullYear()} Peluquería. Todos los derechos reservados.</p>
          <div className="mt-4 md:mt-0 flex gap-4 text-sm">
            <a href="#" className="hover:text-foreground transition-colors">Términos</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
            <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
