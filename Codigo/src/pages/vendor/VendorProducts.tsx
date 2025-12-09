import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserNumericId } from '@/hooks/useDashboardData';
import { ProductForm } from '@/components/vendor/ProductForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, Package, AlertTriangle } from 'lucide-react';
import { Product, Category } from '@/types';

export default function VendorProducts() {
  const navigate = useNavigate();
  const { userId, loading: userIdLoading } = useUserNumericId();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product')
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
          )
        `
        )
        .eq('id_vendor', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts((data as unknown as Product[]) || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('category')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    if (!userIdLoading && userId) {
      fetchProducts();
      fetchCategories();
    }
  }, [userId, userIdLoading]);

  const handleCreate = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingProduct || !userId) return;

    try {
      // Verificar que el producto pertenece al vendedor
      const { error: checkError } = await supabase
        .from('product')
        .select('id_vendor')
        .eq('id', deletingProduct.id)
        .eq('id_vendor', userId)
        .single();

      if (checkError) {
        throw new Error('No tienes permiso para eliminar este producto');
      }

      // Eliminar el producto
      const { error } = await supabase.from('product').delete().eq('id', deletingProduct.id);

      if (error) throw error;

      toast.success('Producto eliminado exitosamente');
      setDeletingProduct(null);
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Error al eliminar el producto');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'SIN STOCK', variant: 'destructive' as const };
    if (stock < 10) return { label: 'BAJO', variant: 'secondary' as const };
    if (stock < 50) return { label: 'MEDIO', variant: 'default' as const };
    return { label: 'ALTO', variant: 'default' as const };
  };

  if (userIdLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive">Error al cargar tu información de usuario</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Productos</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {showForm ? (
        <ProductForm
          product={editingProduct || undefined}
          vendorId={userId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      ) : (
        <>
          {products.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes productos aún</h3>
                <p className="text-muted-foreground mb-4">
                  Comienza agregando tu primer producto a tu catálogo
                </p>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Primer Producto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Lista de Productos</CardTitle>
                <CardDescription>
                  Tienes {products.length} producto{products.length !== 1 ? 's' : ''} en tu catálogo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Creación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product.stock);
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>
                            {product.category?.name || 'Sin categoría'}
                          </TableCell>
                          <TableCell>${product.price.toLocaleString()}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(product.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingProduct(product)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto{' '}
              <strong>{deletingProduct?.name}</strong> de tu catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

