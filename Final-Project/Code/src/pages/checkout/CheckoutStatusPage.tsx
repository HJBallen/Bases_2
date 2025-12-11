import { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Clock, ArrowLeft, Star } from "lucide-react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUserNumericId } from "@/hooks/useDashboardData";
import { RatingDialog } from "@/components/rating/RatingDialog";

type Variant = "success" | "failure" | "pending";

interface OrderItem {
  id: number;
  id_product: string;
  quantity: number;
  total_price: number;
  product?: {
    name: string;
    id_vendor: number;
  } | null;
}

interface Order {
  id: number;
  state: string;
  created_at: string;
  id_payment: string | null;
  payment?: {
    id: string;
    status: string | null;
  } | null;
  order_item?: OrderItem[];
}

interface CheckoutStatusPageProps {
  variant: Variant;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
  }).format(price);

const mapOrderState = (state: string | null | undefined): string => {
  switch (state) {
    case "PEN":
      return "Pendiente";
    case "PAG":
      return "Pagada";
    case "CAN":
      return "Cancelada";
    case "FAL":
      return "Fallida";
    default:
      return state ?? "Desconocido";
  }
};

const mapPaymentStatus = (status: string | null | undefined): string => {
  switch (status) {
    case "PE":
      return "Pendiente";
    case "AP":
      return "Aprobado";
    case "RE":
      return "Rechazado";
    case "CA":
      return "Cancelado";
    default:
      return status ?? "Desconocido";
  }
};

const VariantConfig: Record<
  Variant,
  {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    accentClass: string;
  }
> = {
  success: {
    title: "¡Pago completado!",
    subtitle:
      "Tu orden fue procesada correctamente. Te enviaremos un correo con los detalles de la compra.",
    icon: <CheckCircle2 className="h-10 w-10 text-emerald-500" />,
    accentClass: "border-emerald-500/30 bg-emerald-50/5",
  },
  failure: {
    title: "El pago no se pudo completar",
    subtitle:
      "Hubo un problema al procesar tu pago. Puedes intentar nuevamente o usar otro método.",
    icon: <XCircle className="h-10 w-10 text-red-500" />,
    accentClass: "border-red-500/30 bg-red-50/5",
  },
  pending: {
    title: "Pago pendiente",
    subtitle:
      "Tu pago está siendo procesado por Mercado Pago. Te notificaremos cuando se confirme.",
    icon: <Clock className="h-10 w-10 text-amber-500" />,
    accentClass: "border-amber-500/30 bg-amber-50/5",
  },
};

const CheckoutStatusPage = ({ variant }: CheckoutStatusPageProps) => {
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const orderId = orderIdParam ? Number(orderIdParam) : null;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Array<{ id: number; name: string }>>([]);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<{ id: number; name: string } | null>(null);
  const cartClearedRef = useRef(false);

  const { clearCart, items: cartItems } = useCart();
  const { user } = useAuth();
  const { userId: customerId, loading: customerIdLoading } = useUserNumericId();

  // Cargar orden + items + pago
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setLoadError("No se encontró el identificador de la orden.");
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data, error } = await supabase
          .from("order")
          .select(
            `
            id,
            state,
            created_at,
            id_payment,
            payment:payment (
              id,
              status
            ),
            order_item:order_item (
              id,
              id_product,
              quantity,
              total_price,
              product:product (
                name,
                id_vendor
              )
            )
          `
          )
          .eq("id", orderId)
          .maybeSingle();

        if (error) {
          console.error(error);
          throw new Error("Error cargando la orden");
        }

        const orderData = data as unknown as Order;
        setOrder(orderData);

        // Extraer vendedores únicos de los productos
        if (orderData?.order_item) {
          const vendorIds = new Set<number>();

          for (const item of orderData.order_item) {
            if (item.product?.id_vendor) {
              vendorIds.add(item.product.id_vendor);
            }
          }

          // Obtener nombres de los vendedores
          if (vendorIds.size > 0) {
            const { data: vendorsData, error: vendorsError } = await supabase
              .from("user")
              .select("id, name, lastname")
              .in("id", Array.from(vendorIds));

            if (!vendorsError && vendorsData) {
              const vendorsList = vendorsData.map((v) => ({
                id: v.id,
                name: `${v.name || ""} ${v.lastname || ""}`.trim() || "Vendedor",
              }));
              setVendors(vendorsList);
            }
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "No fue posible cargar los datos de la orden.";
        setLoadError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Limpiar carrito cuando el pago fue exitoso (solo una vez)
  useEffect(() => {
    if (!order) return;
    if (variant !== "success") return;
    if (cartClearedRef.current) return; // Ya se limpió anteriormente

    // Solo limpiamos si la orden está marcada como pagada y el carrito tiene items
    if (order.state === "PAG" && cartItems.length > 0) {
      cartClearedRef.current = true;
      clearCart(true); // Limpiar silenciosamente (sin toast)
    }
  }, [order, variant, cartItems.length, clearCart]);

  const totals = useMemo(() => {
    if (!order?.order_item) return { total: 0, itemsCount: 0 };

    const total = order.order_item.reduce(
      (sum, it) => sum + Number(it.total_price || 0),
      0
    );
    const itemsCount = order.order_item.reduce(
      (sum, it) => sum + (it.quantity || 0),
      0
    );

    return { total, itemsCount };
  }, [order]);

  const config = VariantConfig[variant];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Card principal */}
          <div
            className={`rounded-2xl border p-6 md:p-8 card-shadow ${config.accentClass}`}
          >
            <div className="mb-6 flex items-center gap-4">
              {config.icon}
              <div>
                <h1 className="font-display text-2xl font-bold md:text-3xl">
                  {config.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {config.subtitle}
                </p>
              </div>
            </div>

            {/* Info de la orden */}
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Cargando información de la orden...
              </p>
            ) : loadError ? (
              <p className="text-sm text-destructive">{loadError}</p>
            ) : order ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      Número de orden
                    </p>
                    <p className="font-mono text-sm font-semibold">
                      #{order.id}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      Fecha
                    </p>
                    <p className="text-sm">
                      {new Date(order.created_at).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      Estado de la orden
                    </p>
                    <p className="text-sm font-semibold">
                      {mapOrderState(order.state)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      Estado del pago
                    </p>
                    <p className="text-sm font-semibold">
                      {mapPaymentStatus(order.payment?.status ?? null)}
                    </p>
                  </div>
                </div>

                {/* Items */}
                {order.order_item && order.order_item.length > 0 && (
                  <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                    <h2 className="font-display text-sm font-semibold">
                      Detalle de productos
                    </h2>
                    <ul className="space-y-2">
                      {order.order_item.map((it) => (
                        <li
                          key={it.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div>
                            <p className="font-medium">
                              {it.product?.name ?? "Producto"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Cantidad: {it.quantity}
                            </p>
                          </div>
                          <p className="font-semibold">
                            {formatPrice(it.total_price)}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                      <span className="text-muted-foreground">
                        Total ({totals.itemsCount}{" "}
                        {totals.itemsCount === 1 ? "artículo" : "artículos"})
                      </span>
                      <span className="font-display text-lg font-semibold">
                        {formatPrice(totals.total)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No se encontró información de la orden.
              </p>
            )}

            {/* Acciones */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="default">
                <Link to="/productos">Seguir comprando</Link>
              </Button>

              {variant === "success" && vendors.length > 0 && customerId && !customerIdLoading && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Si hay múltiples vendedores, mostrar el primero (o se puede mejorar para mostrar selección)
                    if (vendors.length === 1) {
                      setSelectedVendor(vendors[0]);
                      setRatingDialogOpen(true);
                    } else {
                      // Por ahora, mostrar el primer vendedor
                      // En el futuro se puede mejorar para permitir seleccionar
                      setSelectedVendor(vendors[0]);
                      setRatingDialogOpen(true);
                    }
                  }}
                  className="gap-2"
                >
                  <Star className="h-4 w-4" />
                  Calificar Vendedor
                </Button>
              )}

              {variant === "failure" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // simplemente volver atrás en el historial
                    window.history.back();
                  }}
                >
                  Intentar nuevamente
                </Button>
              )}

              {variant === "pending" && orderId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Actualizar estado
                </Button>
              )}

              <Button asChild variant="ghost">
                <Link to="/" className="inline-flex items-center gap-2 text-sm">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Diálogo de calificación */}
      {selectedVendor && customerId && (
        <RatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          vendorId={selectedVendor.id}
          vendorName={selectedVendor.name}
          customerId={customerId}
          orderId={orderId || 0}
        />
      )}
    </div>
  );
};

export default CheckoutStatusPage;

/**
 * Wrappers específicos para las rutas
 */

export const CheckoutSuccessPage = () => (
  <CheckoutStatusPage variant="success" />
);

export const CheckoutFailurePage = () => (
  <CheckoutStatusPage variant="failure" />
);

export const CheckoutPendingPage = () => (
  <CheckoutStatusPage variant="pending" />
);
