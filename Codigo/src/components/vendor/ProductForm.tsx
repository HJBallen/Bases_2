import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';
import { Category, Product } from '@/types';

// Función para generar UUID v4 compatible
function generateUUID(): string {
  // Intentar usar crypto.randomUUID si está disponible
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: generar UUID v4 manualmente
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  stock: z.number().min(0, 'El stock no puede ser negativo').int('El stock debe ser un número entero'),
  id_category: z.number().min(1, 'Debes seleccionar una categoría'),
  features: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  vendorId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, vendorId, onSuccess, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          price: product.price,
          stock: product.stock,
          id_category: product.id_category,
          features: product.features || '',
        }
      : {
          name: '',
          price: 0,
          stock: 0,
          id_category: categories.length > 0 ? categories[0].id : 0,
          features: '',
        },
  });

  const selectedCategory = watch('id_category');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('category')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        const fetchedCategories = data || [];
        setCategories(fetchedCategories);
        
        // Si no hay producto y hay categorías, establecer la primera como default
        if (!product && fetchedCategories.length > 0 && !selectedCategory) {
          setValue('id_category', fetchedCategories[0].id);
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        toast.error('Error al cargar las categorías');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [product, selectedCategory, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);

    try {
      if (product) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('product')
          .update({
            name: data.name,
            price: data.price,
            stock: data.stock,
            id_category: data.id_category,
            features: data.features || null,
          })
          .eq('id', product.id)
          .eq('id_vendor', vendorId); // Asegurar que solo actualice sus propios productos

        if (error) throw error;

        toast.success('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        // Generar un ID único para el producto (UUID)
        const productId = generateUUID();

        const { error } = await supabase.from('product').insert({
          id: productId,
          name: data.name,
          price: data.price,
          stock: data.stock,
          id_category: data.id_category,
          id_vendor: vendorId,
          features: data.features || null,
        });

        if (error) throw error;

        toast.success('Producto creado exitosamente');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? 'Editar Producto' : 'Nuevo Producto'}</CardTitle>
        <CardDescription>
          {product ? 'Modifica la información del producto' : 'Completa la información para crear un nuevo producto'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Producto *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ej: Camiseta de algodón"
              disabled={loading}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                {...register('stock', { valueAsNumber: true })}
                placeholder="0"
                disabled={loading}
              />
              {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_category">Categoría *</Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando categorías...
              </div>
            ) : (
              <Select
                value={selectedCategory && selectedCategory > 0 ? selectedCategory.toString() : ''}
                onValueChange={(value) => setValue('id_category', parseInt(value), { shouldValidate: true })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.id_category && (
              <p className="text-sm text-destructive">{errors.id_category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Características</Label>
            <Textarea
              id="features"
              {...register('features')}
              placeholder="Describe las características del producto (opcional)"
              rows={4}
              disabled={loading}
            />
            {errors.features && (
              <p className="text-sm text-destructive">{errors.features.message}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {product ? 'Actualizar' : 'Crear'} Producto
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

