import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Tipos para las vistas
export interface VendorSalesSummary {
  vendor_id: number;
  vendor_name: string;
  vendor_lastname: string;
  orders_count: number;
  gross_sales: number;
  total_items_sold: number;
}

export interface CategorySales {
  category_id: number;
  category_name: string;
  total_items_sold: number;
  total_revenue: number;
}

export interface OrderSummary {
  order_id: number;
  order_date: string;
  order_state: string;
  id_customer: number;
  customer_name: string;
  customer_lastname: string;
  id_payment: string;
  payment_status: string;
  payment_method_name: string | null;
  total_items: number;
  order_total: number;
}

export interface InventoryStatus {
  product_id: string;
  product_name: string;
  category_name: string;
  vendor_id: number;
  vendor_name: string;
  stock: number;
  stock_status: string;
}

export interface VendorRating {
  vendor_id: number;
  vendor_name: string;
  vendor_lastname: string;
  ratings_count: number;
  avg_rating: number;
}

export interface OrderItemDetailed {
  order_item_id: number;
  order_id: number;
  order_date: string;
  order_state: string;
  quantity: number;
  total_price: number;
  product_id: string;
  product_name: string;
  vendor_id: number;
  category_id: number;
  category_name: string;
  customer_id: number;
  customer_name: string;
  customer_lastname: string;
  payment_id: string;
  payment_status: string;
  payment_method_id: number | null;
  payment_method_name: string | null;
}

export interface ProductCatalog {
  product_id: string;
  product_name: string;
  price: number;
  stock: number;
  created_at: string;
  category_id: number;
  category_name: string;
  vendor_id: number;
  vendor_name: string;
  vendor_lastname: string;
  main_image_url: string | null;
}

// Hook para obtener el ID numérico del usuario desde la tabla user
export function useUserNumericId() {
  const { user } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserId(null);
      setLoading(false);
      return;
    }

    const fetchUserId = async () => {
      try {
        const { data, error } = await supabase
          .from('user')
          .select('id')
          .eq('uuid', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user id:', error);
          setUserId(null);
        } else {
          setUserId(data?.id ?? null);
        }
      } catch (error) {
        console.error('Error fetching user id:', error);
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserId();
  }, [user]);

  return { userId, loading };
}

// Hook para datos del dashboard de administrador
export function useAdminDashboard() {
  const [vendorSales, setVendorSales] = useState<VendorSalesSummary[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus[]>([]);
  const [vendorRatings, setVendorRatings] = useState<VendorRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  const hasInitialLoadRef = useRef(false);

  const fetchAllData = useCallback(async (force = false) => {
    // Si ya se cargó inicialmente y no es forzado, no recargar
    if (!force && hasInitialLoadRef.current) {
      return;
    }

    setLoading(true);
    setError(null);

    // Timeout de seguridad para evitar que se quede cargando indefinidamente
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        setLoading(false);
        setError('Tiempo de espera agotado. Por favor, intenta recargar.');
      }
    }, 30000); // 30 segundos

    try {
      // Consultar todas las vistas en paralelo
      const [
        vendorSalesRes,
        categorySalesRes,
        orderSummaryRes,
        inventoryRes,
        ratingsRes,
      ] = await Promise.all([
        supabase.from('v_vendor_sales_summary').select('*'),
        supabase.from('v_category_sales').select('*'),
        supabase.from('v_order_summary').select('*').order('order_date', { ascending: false }),
        supabase.from('v_inventory_status').select('*'),
        supabase.from('v_vendor_ratings').select('*'),
      ]);

      clearTimeout(timeoutId);

      if (!isMountedRef.current) return;

      if (vendorSalesRes.error) throw vendorSalesRes.error;
      if (categorySalesRes.error) throw categorySalesRes.error;
      if (orderSummaryRes.error) throw orderSummaryRes.error;
      if (inventoryRes.error) throw inventoryRes.error;
      if (ratingsRes.error) throw ratingsRes.error;

      setVendorSales((vendorSalesRes.data as VendorSalesSummary[]) ?? []);
      setCategorySales((categorySalesRes.data as CategorySales[]) ?? []);
      setOrderSummary((orderSummaryRes.data as OrderSummary[]) ?? []);
      setInventoryStatus((inventoryRes.data as InventoryStatus[]) ?? []);
      setVendorRatings((ratingsRes.data as VendorRating[]) ?? []);
      hasInitialLoadRef.current = true;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (isMountedRef.current) {
        console.error('Error fetching admin dashboard data:', err);
        setError(err.message ?? 'Error cargando datos');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    hasInitialLoadRef.current = false;

    // Cargar datos iniciales
    fetchAllData(true);

    // Listener para cuando la pestaña vuelve a estar visible
    const handleVisibilityChange = () => {
      if (!document.hidden && isMountedRef.current) {
        // No recargar automáticamente al volver a la pestaña
        // El usuario puede usar el botón de actualizar si necesita refrescar
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Solo ejecutar una vez al montar

  // Calcular KPIs
  const totalSales = vendorSales.reduce((sum, v) => sum + v.gross_sales, 0);
  const totalOrders = orderSummary.length;
  const totalProducts = inventoryStatus.length;
  const lowStockProducts = inventoryStatus.filter(
    (p) => p.stock_status === 'BAJO' || p.stock_status === 'SIN STOCK'
  ).length;

  return {
    vendorSales,
    categorySales,
    orderSummary,
    inventoryStatus,
    vendorRatings,
    loading,
    error,
    refetch: () => fetchAllData(true),
    // KPIs
    totalSales,
    totalOrders,
    totalProducts,
    lowStockProducts,
  };
}

// Hook para datos del dashboard de vendedor
export function useVendorDashboard() {
  const { userId, loading: userIdLoading } = useUserNumericId();
  const [vendorSales, setVendorSales] = useState<VendorSalesSummary | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemDetailed[]>([]);
  const [inventoryStatus, setInventoryStatus] = useState<InventoryStatus[]>([]);
  const [vendorRating, setVendorRating] = useState<VendorRating | null>(null);
  const [productCatalog, setProductCatalog] = useState<ProductCatalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Consultar vistas filtradas por vendor_id
      const [
        vendorSalesRes,
        orderItemsRes,
        inventoryRes,
        ratingsRes,
        catalogRes,
      ] = await Promise.all([
        supabase
          .from('v_vendor_sales_summary')
          .select('*')
          .eq('vendor_id', userId)
          .maybeSingle(),
        supabase
          .from('v_order_items_detailed')
          .select('*')
          .eq('vendor_id', userId)
          .order('order_date', { ascending: false })
          .limit(50),
        supabase
          .from('v_inventory_status')
          .select('*')
          .eq('vendor_id', userId),
        supabase
          .from('v_vendor_ratings')
          .select('*')
          .eq('vendor_id', userId)
          .maybeSingle(),
        supabase
          .from('v_product_catalog')
          .select('*')
          .eq('vendor_id', userId)
          .order('created_at', { ascending: false }),
      ]);

      if (vendorSalesRes.error) throw vendorSalesRes.error;
      if (orderItemsRes.error) throw orderItemsRes.error;
      if (inventoryRes.error) throw inventoryRes.error;
      if (ratingsRes.error) throw ratingsRes.error;
      if (catalogRes.error) throw catalogRes.error;

      setVendorSales((vendorSalesRes.data as VendorSalesSummary) ?? null);
      setOrderItems((orderItemsRes.data as OrderItemDetailed[]) ?? []);
      setInventoryStatus((inventoryRes.data as InventoryStatus[]) ?? []);
      setVendorRating((ratingsRes.data as VendorRating) ?? null);
      setProductCatalog((catalogRes.data as ProductCatalog[]) ?? []);
    } catch (err: any) {
      console.error('Error fetching vendor dashboard data:', err);
      setError(err.message ?? 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userIdLoading) {
      fetchAllData();
    }
  }, [userIdLoading, fetchAllData]);

  // Calcular KPIs
  const mySales = vendorSales?.gross_sales ?? 0;
  const myOrders = vendorSales?.orders_count ?? 0;
  const myProducts = productCatalog.length;
  const pendingOrders = orderItems.filter(
    (o) => o.order_state === 'pendiente' || o.order_state === 'PENDIENTE'
  ).length;
  const lowStockCount = inventoryStatus.filter(
    (p) => p.stock_status === 'BAJO' || p.stock_status === 'SIN STOCK'
  ).length;

  return {
    vendorSales,
    orderItems,
    inventoryStatus,
    vendorRating,
    productCatalog,
    loading: loading || userIdLoading,
    error,
    refetch: fetchAllData,
    // KPIs
    mySales,
    myOrders,
    myProducts,
    pendingOrders,
    lowStockCount,
  };
}

