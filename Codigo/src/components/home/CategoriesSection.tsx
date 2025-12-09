import { Link } from 'react-router-dom';
import { ArrowRight, Loader2, Package } from 'lucide-react';
import { useBogoGoApi } from '@/hooks/useBogoGoApi';

// Función para obtener un ícono basado en el nombre de la categoría
function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes('ropa') || name.includes('vestido') || name.includes('camisa')) {
    return <Package className="h-8 w-8" />;
  }
  if (name.includes('zapato') || name.includes('calzado')) {
    return <Package className="h-8 w-8" />;
  }
  if (name.includes('accesorio')) {
    return <Package className="h-8 w-8" />;
  }
  return <Package className="h-8 w-8" />;
}

export function CategoriesSection() {
  const { categories, products, loading } = useBogoGoApi({ autoLoad: true });

  // Contar productos por categoría
  const categoriesWithCount = categories.map((category) => {
    const count = products.filter((p) => p.id_category === category.id && p.stock > 0).length;
    return { ...category, productCount: count };
  });

  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <span className="text-sm font-medium uppercase tracking-wide text-primary">
            Explora
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
            Categorías de Moda
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Encuentra tu estilo perfecto navegando por nuestras colecciones
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : categoriesWithCount.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categoriesWithCount.map((category, index) => (
              <Link
                key={category.id}
                to={`/productos?categoria=${category.id}`}
                className="animate-fade-up group relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl bg-card p-8 card-shadow transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="rounded-xl bg-muted p-4 transition-colors group-hover:bg-primary-foreground/20">
                  <span className="text-primary transition-colors group-hover:text-primary-foreground">
                    {getCategoryIcon(category.name)}
                  </span>
                </div>
                <div className="text-center">
                  <h3 className="font-display text-lg font-semibold">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground transition-colors group-hover:text-primary-foreground/80">
                    {category.description || 'Explora esta categoría'}
                  </p>
                  {category.productCount > 0 && (
                    <p className="mt-2 text-xs font-medium text-primary transition-colors group-hover:text-primary-foreground">
                      {category.productCount} producto{category.productCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 opacity-0 transition-all duration-300 group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay categorías disponibles en este momento</p>
          </div>
        )}
      </div>
    </section>
  );
}
