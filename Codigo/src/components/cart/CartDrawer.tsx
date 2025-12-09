import { useState } from "react";
import { X, Plus, Minus, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalPrice,
    clearCart,
  } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(price);
  };

  const handleCheckout = async () => {
    if (items.length === 0 || isCheckingOut) return;

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // TODO: aquí deberías usar el ID del cliente real (por ejemplo, de tu tabla user/perfil)
      // También podrías tenerlo en un contexto de Auth.
      const customerId = 1; // <-- reemplaza por el id_customer real

      // 1. Crear registro de Payment
      const { data: payment, error: paymentError } = await supabase
        .from("payment")
        .insert({
          status: "PE", // pendiente
          id_payment_method: 1, // <-- ajusta según tu tabla payment_method (ej. 1 = Mercado Pago)
        })
        .select()
        .single();

      if (paymentError || !payment) {
        console.error("Error creando payment:", paymentError);
        throw new Error("No se pudo crear el pago");
      }

      // 2. Crear Order en estado pendiente (PEN)
      const { data: order, error: orderError } = await supabase
        .from("order")
        .insert({
          id_customer: customerId,
          id_payment: payment.id,
          state: "PEN",
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error("Error creando order:", orderError);
        throw new Error("No se pudo crear la orden");
      }

      // 3. Crear los Order Items
      const orderItemsPayload = items.map((item) => ({
        id_order: order.id,
        id_product: item.product.id,
        quantity: item.quantity,
        total_price: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_item")
        .insert(orderItemsPayload);

      if (itemsError) {
        console.error("Error creando order_item:", itemsError);
        throw new Error("No se pudieron crear los items de la orden");
      }

      // 4. Llamar a la Edge Function create-mp-preference
      const baseUrl = window.location.origin;

      const { data, error: funcError } = await supabase.functions.invoke(
        "create-mp-preference", // nombre de tu Edge Function
        {
          body: {
            orderId: order.id,
            successUrl: `${baseUrl}/checkout/success?orderId=${order.id}`,
            failureUrl: `${baseUrl}/checkout/failure?orderId=${order.id}`,
            pendingUrl: `${baseUrl}/checkout/pending?orderId=${order.id}`,
          },
        }
      );

      if (funcError) {
        console.error("Error en create-mp-preference:", funcError);
        throw new Error(
          funcError.message || "Error al crear la preferencia de pago"
        );
      }

      const initPoint = data?.init_point;
      if (!initPoint) {
        console.error("Respuesta inesperada de create-mp-preference:", data);
        throw new Error("No se recibió la URL de pago de Mercado Pago");
      }

      // Opcional: cerrar el carrito antes de redirigir
      setIsCartOpen(false);

      // (Opcional) podrías limpiar el carrito aquí o después del regreso en la página de success
      // clearCart();

      // 5. Redirigir a Mercado Pago
      window.location.href = initPoint;
    } catch (err: any) {
      console.error(err);
      setCheckoutError(
        err?.message ||
          "Ocurrió un error al iniciar el pago con Mercado Pago. Intenta de nuevo."
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm transition-opacity duration-300",
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
          isCartOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Tu Carrito</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCartOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-muted p-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium">
                  Tu carrito está vacío
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Añade productos para empezar a comprar
                </p>
              </div>
              <Button
                variant="default"
                onClick={() => setIsCartOpen(false)}
                asChild
              >
                <Link to="/productos">Ver productos</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.product.id}
                  className="flex gap-4 rounded-xl border border-border bg-card p-4 card-shadow"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={
                        item.product.multimedia?.[0]?.src || "/placeholder.svg"
                      }
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h4 className="font-medium leading-tight">
                        {item.product.name}
                      </h4>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-lg border border-border">
                        <button
                          className="p-2 transition-colors hover:bg-muted"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          className="p-2 transition-colors hover:bg-muted"
                          onClick={() =>
                            updateQuantity(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-6 py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-display text-xl font-semibold">
                {formatPrice(totalPrice)}
              </span>
            </div>

            {checkoutError && (
              <p className="mb-2 text-sm text-destructive">
                {checkoutError}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirigiendo a Mercado Pago...
                  </>
                ) : (
                  "Finalizar Compra"
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={clearCart}
                disabled={isCheckingOut}
              >
                Vaciar Carrito
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
