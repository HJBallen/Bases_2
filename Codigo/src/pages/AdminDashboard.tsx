import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Package, Users, BarChart3, Settings, ShoppingCart, Tag, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminDashboard } from '@/hooks/useDashboardData';
import {
  VendorSalesChart,
  CategorySalesPieChart,
  CategorySalesBarChart,
  InventoryStatusChart,
  OrdersByStateChart,
  VendorRatingsChart,
  TopProductsChart,
} from '@/components/dashboard/Charts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function AdminSidebar() {
  return (
    <aside className="hidden w-64 border-r border-border bg-card lg:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="font-display text-xl font-bold">
          <span className="text-primary">BOGO</span>GO Admin
        </span>
      </div>
      <nav className="space-y-1 p-4">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Package className="h-4 w-4" />
          Productos
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <ShoppingCart className="h-4 w-4" />
          Pedidos
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Users className="h-4 w-4" />
          Usuarios
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Tag className="h-4 w-4" />
          Categorías
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          Configuración
        </Button>
      </nav>
    </aside>
  );
}

function DashboardHome() {
  const {
    vendorSales,
    categorySales,
    orderSummary,
    inventoryStatus,
    vendorRatings,
    loading,
    error,
    refetch,
    totalSales,
    totalOrders,
    totalProducts,
    lowStockProducts,
  } = useAdminDashboard();

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
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido al panel de administración de Bogogo.</p>
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
  const topProductsData = orderSummary.flatMap((order) => {
    // Necesitamos obtener los items de cada orden
    // Por ahora usamos datos de ejemplo, pero deberías consultar v_order_items_detailed
    return [];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al panel de administración de Bogogo.</p>
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
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total acumulado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">En catálogo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid gap-4 md:grid-cols-2">
        <VendorSalesChart data={vendorSales} />
        <CategorySalesPieChart data={categorySales} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CategorySalesBarChart data={categorySales} />
        <InventoryStatusChart data={inventoryStatus} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <OrdersByStateChart data={orderSummary} />
        <VendorRatingsChart data={vendorRatings} />
      </div>

      {/* Tabla de pedidos recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recientes</CardTitle>
          <CardDescription>Últimos 10 pedidos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderSummary.slice(0, 10).map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell className="font-medium">#{order.order_id}</TableCell>
                  <TableCell>
                    {order.customer_name} {order.customer_lastname}
                  </TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={order.order_state === 'completado' ? 'default' : 'secondary'}>
                      {order.order_state}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.payment_method_name || 'N/A'}</TableCell>
                  <TableCell className="font-medium">${order.order_total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
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

  if (userRole !== 'administrador') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <Routes>
          <Route index element={<DashboardHome />} />
        </Routes>
      </main>
    </div>
  );
}
