import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Gráfica de barras para ventas por vendedor
export function VendorSalesChart({ data }: { data: Array<{ vendor_name: string; gross_sales: number }> }) {
  const chartData = data
    .sort((a, b) => b.gross_sales - a.gross_sales)
    .slice(0, 10)
    .map((item) => ({
      name: item.vendor_name.length > 15 ? item.vendor_name.substring(0, 15) + '...' : item.vendor_name,
      ventas: Math.round(item.gross_sales),
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vendedores</CardTitle>
        <CardDescription>Ventas totales por vendedor</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Bar dataKey="ventas" fill="#0088FE" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Gráfica de pie para ventas por categoría
export function CategorySalesPieChart({ data }: { data: Array<{ category_name: string; total_revenue: number }> }) {
  const chartData = data.map((item) => ({
    name: item.category_name,
    value: Math.round(item.total_revenue),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por Categoría</CardTitle>
        <CardDescription>Distribución de ingresos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Gráfica de barras para ventas por categoría
export function CategorySalesBarChart({ data }: { data: Array<{ category_name: string; total_revenue: number; total_items_sold: number }> }) {
  const chartData = data.map((item) => ({
    name: item.category_name,
    ingresos: Math.round(item.total_revenue),
    items: item.total_items_sold,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por Categoría</CardTitle>
        <CardDescription>Ingresos e items vendidos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value: number) => typeof value === 'number' ? value.toLocaleString() : value} />
            <Legend />
            <Bar yAxisId="left" dataKey="ingresos" fill="#0088FE" name="Ingresos ($)" />
            <Bar yAxisId="right" dataKey="items" fill="#00C49F" name="Items Vendidos" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Gráfica de línea para evolución de ventas
export function SalesTrendChart({ data }: { data: Array<{ date: string; sales: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de Ventas</CardTitle>
        <CardDescription>Tendencia de ventas en el tiempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#0088FE" strokeWidth={2} name="Ventas" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Gráfica de barras para estado de inventario
export function InventoryStatusChart({ data }: { data: Array<{ stock_status: string }> }) {
  const statusCounts = data.reduce((acc, item) => {
    acc[item.stock_status] = (acc[item.stock_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    cantidad: value,
  }));

  const statusColors: Record<string, string> = {
    'SIN STOCK': '#FF8042',
    'BAJO': '#FFBB28',
    'MEDIO': '#0088FE',
    'ALTO': '#00C49F',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Inventario</CardTitle>
        <CardDescription>Productos por nivel de stock</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[entry.name] || COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Gráfica de barras para pedidos por estado
export function OrdersByStateChart({ data }: { data: Array<{ order_state: string }> }) {
  const stateCounts = data.reduce((acc, item) => {
    acc[item.order_state] = (acc[item.order_state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(stateCounts).map(([name, value]) => ({
    name,
    cantidad: value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos por Estado</CardTitle>
        <CardDescription>Distribución de pedidos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Gráfica de barras para calificaciones de vendedores
export function VendorRatingsChart({ data }: { data: Array<{ vendor_name: string; avg_rating: number; ratings_count: number }> }) {
  const chartData = data
    .sort((a, b) => b.avg_rating - a.avg_rating)
    .slice(0, 10)
    .map((item) => ({
      name: item.vendor_name.length > 15 ? item.vendor_name.substring(0, 15) + '...' : item.vendor_name,
      calificacion: Number(item.avg_rating.toFixed(2)),
      reviews: item.ratings_count,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calificaciones de Vendedores</CardTitle>
        <CardDescription>Promedio de calificaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="calificacion" fill="#FFBB28" name="Calificación" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Gráfica de barras para productos más vendidos
export function TopProductsChart({ data }: { data: Array<{ product_name: string; quantity: number }> }) {
  const productCounts = data.reduce((acc, item) => {
    acc[item.product_name] = (acc[item.product_name] || 0) + item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(productCounts)
    .map(([name, quantity]) => ({ name, cantidad: quantity }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10)
    .map((item) => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      cantidad: item.cantidad,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos Más Vendidos</CardTitle>
        <CardDescription>Top 10 productos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

