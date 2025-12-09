import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Envío Gratis',
    description: 'En pedidos superiores a 50€',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Pago Seguro',
    description: 'Transacciones 100% protegidas',
  },
  {
    icon: <RotateCcw className="h-6 w-6" />,
    title: 'Devolución Fácil',
    description: '30 días para devolver',
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: 'Soporte 24/7',
    description: 'Atención personalizada',
  },
];

export function PromoSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 md:p-16">
          {/* Decorative Elements */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left">
            <div className="flex-1">
              <span className="text-sm font-medium uppercase tracking-wide text-primary">
                Oferta Especial
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-background md:text-4xl lg:text-5xl">
                Hasta 50% de Descuento
              </h2>
              <p className="mt-4 max-w-lg text-background/70">
                Aprovecha nuestras ofertas exclusivas en productos seleccionados. 
                Tiempo limitado.
              </p>
              <Button variant="hero" size="lg" className="mt-6" asChild>
                <Link to="/productos">
                  Comprar Ahora
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="flex-1">
              <div className="font-display text-7xl font-bold text-primary md:text-8xl lg:text-9xl">
                50%
              </div>
              <div className="text-2xl font-medium text-background/80">OFF</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-up flex items-center gap-4 rounded-xl border border-border bg-card p-6 card-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
