import { Link } from 'react-router-dom';
import { ArrowRight, Package, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useBogoGoApi } from '@/hooks/useBogoGoApi';

// Función para obtener un ícono basado en el nombre de la categoría
function getCategoryIcon(categoryName: string) {
  const name = categoryName.toLowerCase();
  if (name.includes('ropa') || name.includes('vestido') || name.includes('camisa')) {
    return <Package className="h-12 w-12" />;
  }
  if (name.includes('zapato') || name.includes('calzado')) {
    return <Package className="h-12 w-12" />;
  }
  if (name.includes('accesorio')) {
    return <Package className="h-12 w-12" />;
  }
  return <Package className="h-12 w-12" />;
}

const Categories = () => {
  const { categories, products, loading, error } = useBogoGoApi({ autoLoad: true });

  // Contar productos por categoría (solo con stock disponible)
  const categoriesWithCount = categories.map((category) => {
    const count = products.filter((p) => p.id_category === category.id && p.stock > 0).length;
    return { ...category, productCount: count };
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-12 text-center">
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              Categorías
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Explora nuestra amplia selección de productos organizados por categorías
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-destructive">Error al cargar las categorías: {error}</p>
            </div>
          )}

          {/* Categories Grid */}
          {!loading && !error && (
            <>
              {categoriesWithCount.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {categoriesWithCount.map((category, index) => (
                    <Link
                      key={category.id}
                      to={`/productos?categoria=${category.id}`}
                      className="animate-fade-up group relative overflow-hidden rounded-3xl bg-card p-8 card-shadow transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Icon */}
                      <div className="mb-6 inline-flex rounded-2xl bg-primary/10 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        {getCategoryIcon(category.name)}
                      </div>

                      {/* Content */}
                      <h2 className="font-display text-2xl font-semibold">
                        {category.name}
                      </h2>
                      <p className="mt-2 text-muted-foreground">
                        {category.description || 'Explora esta categoría'}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                        {category.productCount} producto{category.productCount !== 1 ? 's' : ''}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>

                      {/* Decorative */}
                      <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-150" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay categorías disponibles en este momento</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Categories;
