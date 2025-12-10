import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // ajusta la ruta si es necesario
import { Category, Order, OrderItem, Product } from '@/types';



// Opciones del hook
interface UseBogoGoApiOptions {
  autoLoad?: boolean; // si quieres que cargue todo al montar el hook
}

export function useBogoGoApi(options: UseBogoGoApiOptions = {}) {
  const { autoLoad = false } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========= FUNCIONES DE CARGA =========

  // Traer categorías
  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    setCategories(data ?? []);
    return data ?? [];
  }, []);

  // Traer productos con categoría e imágenes
  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from("product")
      .select(
        `
        id,
        name,
        price,
        created_at,
        stock,
        id_vendor,
        features,
        id_category,
        category:category (
          id,
          name,
          description
        ),
        multimedia:multimedia (
          id,
          alt,
          src,
          id_product
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    setProducts((data as unknown as Product[]) ?? []);
    return (data as unknown as Product[]) ?? [];
  }, []);

  // Traer un solo producto por id
  const fetchProductById = useCallback(async (productId: string) => {
    const { data, error } = await supabase
      .from("product")
      .select(
        `
        id,
        name,
        price,
        created_at,
        stock,
        id_vendor,
        features,
        id_category,
        category:category (
          id,
          name,
          description
        ),
        multimedia:multimedia (
          id,
          alt,
          src,
          id_product
        )
      `
      )
      .eq("id", productId)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Product | null;
  }, []);

  // Traer órdenes de un cliente (por ahora pasamos el id_customer a mano)
  const fetchOrdersByCustomer = useCallback(async (customerId: number) => {
    // 1. Órdenes + pago
    const { data: ordersData, error: ordersError } = await supabase
      .from("order")
      .select(
        `
        id,
        id_customer,
        id_payment,
        state,
        created_at,
        payment:payment (
          id,
          created_at,
          status,
          id_payment_method
        )
      `
      )
      .eq("id_customer", customerId)
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    const baseOrders = (ordersData as Order[]) ?? [];

    if (baseOrders.length === 0) {
      setOrders([]);
      return [];
    }

    // 2. Items de todas las órdenes de una
    const orderIds = baseOrders.map((o) => o.id);

    const { data: itemsData, error: itemsError } = await supabase
      .from("order_item")
      .select("*")
      .in("id_order", orderIds);

    if (itemsError) throw itemsError;

    const items = (itemsData as OrderItem[]) ?? [];

    // 3. Agrupar items dentro de cada orden
    const ordersWithItems = baseOrders.map((order) => ({
      ...order,
      items: items.filter((it) => it.id_order === order.id),
    }));

    setOrders(ordersWithItems);
    return ordersWithItems;
  }, []);

  // Recargar TODO (lo que nos interese cargar al inicio)
  const reloadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchCategories(), fetchProducts()]);
      // Las órdenes normalmente dependen del usuario logueado,
      // así que no las cargo aquí automáticamente.
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, [fetchCategories, fetchProducts]);

  // Auto-carga inicial si se pide
  useEffect(() => {
    if (autoLoad) {
      void reloadAll();
    }
  }, [autoLoad, reloadAll]);

  return {
    // estado
    products,
    categories,
    orders,
    loading,
    error,

    // acciones
    reloadAll,
    fetchProducts,
    fetchCategories,
    fetchProductById,
    fetchOrdersByCustomer,
  };
}
