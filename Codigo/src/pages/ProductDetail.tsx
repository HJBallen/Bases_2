import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ChevronLeft, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Button } from '@/components/ui/button';
import { getProductById, products } from '@/data/mockData';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/product/ProductCard';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = getProductById(id || '');
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold">Producto no encontrado</h1>
            <p className="mt-2 text-muted-foreground">
              El producto que buscas no existe o ha sido eliminado
            </p>
            <Button variant="default" className="mt-4" asChild>
              <Link to="/productos">Ver productos</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.id_category === product.id_category)
    .slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              to="/productos"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a productos
            </Link>
          </nav>

          {/* Product Detail */}
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-3xl bg-muted">
                <img
                  src={product.multimedia?.[0]?.src || '/placeholder.svg'}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <span className="text-sm font-medium uppercase tracking-wide text-primary">
                {product.category?.name}
              </span>

              <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  (128 valoraciones)
                </span>
              </div>

              {/* Price */}
              <div className="mt-6">
                <span className="font-display text-4xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Features */}
              {product.features && (
                <div className="mt-6">
                  <h3 className="font-medium">Características</h3>
                  <p className="mt-2 text-muted-foreground">{product.features}</p>
                </div>
              )}

              {/* Stock */}
              <div className="mt-6">
                <span
                  className={`text-sm font-medium ${
                    product.stock > 10 ? 'text-green-600' : 'text-destructive'
                  }`}
                >
                  {product.stock > 10
                    ? `En stock (${product.stock} unidades)`
                    : `¡Últimas ${product.stock} unidades!`}
                </span>
              </div>

              {/* Quantity & Actions */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">Cantidad:</label>
                  <div className="flex items-center gap-2 rounded-lg border border-border">
                    <button
                      className="px-4 py-2 transition-colors hover:bg-muted"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      className="px-4 py-2 transition-colors hover:bg-muted"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="hero"
                    size="xl"
                    className="flex-1"
                    onClick={() => addToCart(product, quantity)}
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Añadir al carrito
                  </Button>
                  <Button variant="outline" size="xl">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-8 grid gap-4 border-t border-border pt-8 sm:grid-cols-3">
                {[
                  { icon: <Truck className="h-5 w-5" />, text: 'Envío gratis' },
                  { icon: <Shield className="h-5 w-5" />, text: 'Garantía 2 años' },
                  { icon: <RotateCcw className="h-5 w-5" />, text: '30 días devolución' },
                ].map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">{benefit.icon}</span>
                    {benefit.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="mb-8 font-display text-2xl font-bold">
                Productos Relacionados
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    className="animate-fade-up"
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default ProductDetail;
