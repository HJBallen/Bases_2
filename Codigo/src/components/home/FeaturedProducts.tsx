import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product/ProductCard';
import { useBogoGoApi } from '@/hooks/useBogoGoApi';

export function FeaturedProducts() {
  const { products, loading } = useBogoGoApi({ autoLoad: true });

  // Obtener los primeros 8 productos más recientes o con stock disponible
  const featuredProducts = products
    .filter((p) => p.stock > 0) // Solo productos con stock
    .slice(0, 8);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-sm font-medium uppercase tracking-wide text-primary">
              Destacados
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Productos Populares
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Los productos más vendidos y mejor valorados por nuestros clientes
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/productos">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                index={index}
                className="animate-fade-up"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay productos disponibles en este momento</p>
          </div>
        )}
      </div>
    </section>
  );
}
