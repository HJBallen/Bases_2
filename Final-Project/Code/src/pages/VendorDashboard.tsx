import { Navigate, Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Package, BarChart3, ShoppingCart, Plus, AlertTriangle, RefreshCw, Star, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVendorDashboard, useUserNumericId, OrderItemDetailed } from '@/hooks/useDashboardData';
import { InventoryStatusChart, TopProductsChart } from '@/components/dashboard/Charts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import VendorProducts from './vendor/VendorProducts';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function VendorSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/vendedor', label: 'Mi Dashboard', icon: BarChart3 },
    { path: '/vendedor/productos', label: 'Mis Productos', icon: Package },
    { path: '/vendedor/ventas', label: 'Mis Ventas', icon: ShoppingCart },
  ];

  return (
    <aside className="hidden w-64 border-r border-border bg-card lg:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="font-display text-xl font-bold">
          <span className="text-primary">BOGO</span>GO Vendedor
        </span>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Button
              key={item.path}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn('w-full justify-start gap-2', isActive && 'bg-secondary')}
              onClick={() => navigate(item.path)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <Button variant="outline" className="w-full justify-start gap-2" asChild>
          <Link to="/">
            <Home className="h-4 w-4" />
            Volver a la Tienda
          </Link>
        </Button>
      </div>
    </aside>
  );
}

function VendorDashboardHome() {
  const navigate = useNavigate();
  const {
    vendorSales,
    orderItems,
    inventoryStatus,
    vendorRating,
    productCatalog,
    loading,
    error,
    refetch,
    mySales,
    myOrders,
    myProducts,
    pendingOrders,
    lowStockCount,
  } = useVendorDashboard();

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
            <p className="text-muted-foreground">Gestiona tus productos y ventas en Bogogo.</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar datos para gráfica de productos más vendidos
  const topProductsData = orderItems.map((item) => ({
    product_name: item.product_name,
    quantity: item.quantity,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
          <p className="text-muted-foreground">Gestiona tus productos y ventas en Bogogo.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Ventas</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myOrders}</div>
            <p className="text-xs text-muted-foreground">{pendingOrders} pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myProducts}</div>
            <p className="text-xs text-muted-foreground">{lowStockCount} con bajo stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mi Calificación</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendorRating ? vendorRating.avg_rating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {vendorRating ? `${vendorRating.ratings_count} calificaciones` : 'Sin calificaciones'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid gap-4 md:grid-cols-2">
        <InventoryStatusChart data={inventoryStatus} />
        {topProductsData.length > 0 && <TopProductsChart data={topProductsData} />}
      </div>

      {/* Tabla de productos con bajo stock */}
      {lowStockCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Productos con Bajo Stock
            </CardTitle>
            <CardDescription>Productos que requieren atención</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryStatus
                  .filter((p) => p.stock_status === 'BAJO' || p.stock_status === 'SIN STOCK')
                  .map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell className="font-medium">{product.product_name}</TableCell>
                      <TableCell>{product.category_name}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge
                          variant={product.stock_status === 'SIN STOCK' ? 'destructive' : 'secondary'}
                        >
                          {product.stock_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tabla de pedidos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
          <CardDescription>Últimos pedidos de tus productos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.slice(0, 10).map((item) => (
                <TableRow key={item.order_item_id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell>
                    {item.customer_name} {item.customer_lastname}
                  </TableCell>
                  <TableCell>{new Date(item.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="font-medium">${item.total_price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={item.order_state === 'completado' ? 'default' : 'secondary'}>
                      {item.order_state}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Gestiona tu tienda de forma eficiente</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button className="gap-2" onClick={() => navigate('/vendedor/productos')}>
            <Plus className="h-4 w-4" />
            Agregar Producto
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate('/vendedor/productos')}>
            <Package className="h-4 w-4" />
            Ver Inventario
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para Mis Ventas
function VendorSales() {
  const { userId, loading: userIdLoading } = useUserNumericId();
  const [sales, setSales] = useState<OrderItemDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchSales = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('v_order_items_detailed')
        .select('*')
        .eq('vendor_id', userId)
        .order('order_date', { ascending: false });

      // Aplicar filtro por estado de orden
      if (filterStatus !== 'all') {
        query = query.eq('order_state', filterStatus);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setSales((data as OrderItemDetailed[]) || []);
    } catch (err: unknown) {
      console.error('Error fetching sales:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  }, [userId, filterStatus]);

  useEffect(() => {
    if (!userIdLoading && userId) {
      fetchSales();
    }
  }, [userId, userIdLoading, fetchSales]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'PEN': { label: 'Pendiente', variant: 'secondary' },
      'PAG': { label: 'Pagado', variant: 'default' },
      'CAN': { label: 'Cancelado', variant: 'destructive' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
    return (
      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
    );
  };

  if (userIdLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Ventas</h1>
            <p className="text-muted-foreground">Gestiona todas tus ventas y pedidos.</p>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchSales}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSales = sales.reduce((sum, sale) => sum + sale.total_price, 0);
  const filteredCount = sales.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Ventas</h1>
          <p className="text-muted-foreground">Gestiona todas tus ventas y pedidos.</p>
        </div>
        <Button variant="outline" onClick={fetchSales}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Filtros y resumen */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalSales)}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCount}</div>
            <p className="text-xs text-muted-foreground">
              {filterStatus !== 'all' ? `Filtrados por ${filterStatus}` : 'Todos los pedidos'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filtrar por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PEN">Pendiente</SelectItem>
                <SelectItem value="PAG">Pagado</SelectItem>
                <SelectItem value="CAN">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ventas</CardTitle>
          <CardDescription>
            {filterStatus !== 'all'
              ? `Mostrando ${filteredCount} pedidos con estado ${filterStatus}`
              : `Total: ${filteredCount} pedidos`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filterStatus !== 'all'
                  ? 'No hay pedidos con este estado'
                  : 'No tienes ventas registradas'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado Pago</TableHead>
                  <TableHead>Estado Orden</TableHead>
                  <TableHead>Método de Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.order_item_id}>
                    <TableCell className="font-medium">#{sale.order_id}</TableCell>
                    <TableCell className="font-medium">{sale.product_name}</TableCell>
                    <TableCell>
                      {sale.customer_name} {sale.customer_lastname}
                    </TableCell>
                    <TableCell>{new Date(sale.order_date).toLocaleDateString()}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell className="font-medium">{formatPrice(sale.total_price)}</TableCell>
                    <TableCell>{getStatusBadge(sale.order_state)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.payment_status === 'AP' ? 'default' : sale.payment_status === 'RE' ? 'destructive' : 'secondary'}>
                        {sale.payment_status === 'PE' ? 'Pendiente' : sale.payment_status === 'AP' ? 'Aprobado' : sale.payment_status === 'RE' ? 'Rechazado' : sale.payment_status === 'CA' ? 'Cancelado' : sale.payment_status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{sale.payment_method_name || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VendorDashboard() {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (userRole !== 'vendedor' && userRole !== 'administrador') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <VendorSidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route index element={<VendorDashboardHome />} />
          <Route path="productos" element={<VendorProducts />} />
          <Route path="ventas" element={<VendorSales />} />
        </Routes>
      </main>
    </div>
  );
}
