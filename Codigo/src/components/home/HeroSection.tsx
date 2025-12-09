import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBogoGoApi } from '@/hooks/useBogoGoApi';

export function HeroSection() {
  const { products, categories, loading } = useBogoGoApi({ autoLoad: true });

  // Calcular estadísticas reales
  const totalProducts = products.filter((p) => p.stock > 0).length;
  const totalCategories = categories.length;
  const formattedProducts = totalProducts >= 1000 ? `${(totalProducts / 1000).toFixed(1)}K+` : totalProducts.toString();

  return (
    <section className="relative overflow-hidden hero-gradient py-16 md:py-24 lg:py-32">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Nueva Temporada 2024</span>
          </div>

          {/* Heading */}
          <h1 
            className="animate-fade-up font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl"
            style={{ animationDelay: '100ms' }}
          >
            Tu Estilo,{' '}
            <span className="relative">
              <span className="relative z-10 text-primary">Tu Esencia</span>
              <span className="absolute bottom-2 left-0 -z-0 h-3 w-full bg-primary/20" />
            </span>
            <br />
            en Bogogo
          </h1>

          {/* Description */}
          <p 
            className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            style={{ animationDelay: '200ms' }}
          >
            Descubre las últimas tendencias en moda. Ropa, calzado y accesorios 
            de las mejores marcas para todos los estilos.
          </p>

          {/* CTA Buttons */}
          <div 
            className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ animationDelay: '300ms' }}
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/productos">
                Explorar Productos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" asChild>
              <Link to="/categorias">
                Ver Categorías
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div 
            className="animate-fade-up mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8"
            style={{ animationDelay: '400ms' }}
          >
            {[
              { value: loading ? '...' : formattedProducts, label: 'Productos' },
              { value: loading ? '...' : totalCategories.toString(), label: 'Categorías' },
              { value: '4.9', label: 'Valoración' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
