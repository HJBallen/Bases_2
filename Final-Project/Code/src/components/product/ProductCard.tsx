import { ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  index?: number;
}

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl bg-card card-shadow transition-all duration-300 hover:-translate-y-1',
        className
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Container */}
      <Link to={`/producto/${product.id}`} className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.multimedia?.[0]?.src || '/placeholder.svg'}
          alt={product.multimedia?.[0]?.alt || product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Wishlist Button */}
        <button 
          className="absolute right-3 top-3 rounded-full bg-background/80 p-2 opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-background group-hover:opacity-100"
          aria-label="Añadir a favoritos"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Stock Badge */}
        {product.stock < 10 && (
          <span className="absolute left-3 top-3 rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground">
            ¡Últimas unidades!
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category */}
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.category?.name || 'Sin categoría'}
        </span>

        {/* Title */}
        <Link to={`/producto/${product.id}`}>
          <h3 className="mt-2 font-display text-lg font-medium leading-tight transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Price & Action */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-display text-xl font-semibold text-primary">
            {formatPrice(product.price)}
          </span>
          <Button
            variant="default"
            size="icon"
            onClick={() => addToCart(product)}
            aria-label="Añadir al carrito"
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
