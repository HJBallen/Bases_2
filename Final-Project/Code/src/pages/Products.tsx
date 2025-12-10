import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Grid3X3, LayoutList } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBogoGoApi } from "@/hooks/useBogoGoApi.ts";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 👉 Hook que trae productos y categorías desde Supabase
  const {
    products,
    categories,
    loading,
    error,
    reloadAll,
  } = useBogoGoApi({ autoLoad: true });

  // Leer parámetro de categoría desde la URL
  useEffect(() => {
    const categoriaParam = searchParams.get('categoria');
    if (categoriaParam) {
      const categoryId = parseInt(categoriaParam, 10);
      if (!isNaN(categoryId)) {
        setSelectedCategory(categoryId);
      }
    }
  }, [searchParams]);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.id_category === selectedCategory)
    : products;

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (categoryId) {
      setSearchParams({ categoria: categoryId.toString() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold md:text-4xl">
                Todos los Productos
              </h1>
              <p className="mt-2 text-muted-foreground">
                Explora nuestra colección completa de productos premium
              </p>
            </div>

            {/* Estado / acciones rápidas */}
            <div className="flex items-center gap-3">
              {loading && (
                <span className="text-sm text-muted-foreground">
                  Cargando productos...
                </span>
              )}
              {error && (
                <span className="text-sm text-destructive">
                  Error: {error}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => reloadAll()}>
                Recargar
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64">
              <div className="rounded-2xl border border-border bg-card p-6 card-shadow">
                <div className="mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  <h3 className="font-display font-semibold">Filtros</h3>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Categoría
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                        selectedCategory === null
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      Todos
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                          selectedCategory === category.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        )}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} productos encontrados
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Products */}
              <div
                className={cn(
                  "grid gap-6",
                  viewMode === "grid"
                    ? "sm:grid-cols-2 xl:grid-cols-3"
                    : "grid-cols-1"
                )}
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    className="animate-fade-up"
                  />
                ))}
              </div>

              {!loading && filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-lg text-muted-foreground">
                    No se encontraron productos en esta categoría
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => handleCategoryChange(null)}
                  >
                    Ver todos los productos
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Products;
