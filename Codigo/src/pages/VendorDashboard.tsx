import { Navigate, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Package, BarChart3, Settings, ShoppingCart, Plus, AlertTriangle, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVendorDashboard } from '@/hooks/useDashboardData';
import { InventoryStatusChart, TopProductsChart } from '@/components/dashboard/Charts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import VendorProducts from './vendor/VendorProducts';

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
        <Button variant="ghost" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          Configuración
        </Button>
      </nav>
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
        </Routes>
      </main>
    </div>
  );
}
