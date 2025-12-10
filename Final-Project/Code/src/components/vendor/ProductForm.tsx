import { useState, useEffect, useRef } from 'react';
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
import { Loader2, Save, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Category, Product, Multimedia } from '@/types';
import { cn } from '@/lib/utils';

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

interface ImageFile {
  file: File;
  preview: string;
  id?: string; // Para imágenes existentes
}

export function ProductForm({ product, vendorId, onSuccess, onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [existingImages, setExistingImages] = useState<Multimedia[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Cargar imágenes existentes si se está editando
  useEffect(() => {
    const fetchExistingImages = async () => {
      if (!product) return;

      try {
        const { data, error } = await supabase
          .from('multimedia')
          .select('*')
          .eq('id_product', product.id)
          .order('id', { ascending: true });

        if (error) throw error;
        setExistingImages((data as Multimedia[]) || []);
      } catch (error: any) {
        console.error('Error fetching existing images:', error);
      }
    };

    fetchExistingImages();
  }, [product]);

  // Limpiar previews al desmontar
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validar que sean imágenes
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast.error('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB por imagen)
    const validFiles = imageFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`La imagen ${file.name} es demasiado grande. Máximo 5MB`);
        return false;
      }
      return true;
    });

    // Crear previews
    const newImages: ImageFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages(prev => [...prev, ...newImages]);

    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const removed = newImages.splice(index, 1)[0];
      if (removed.preview.startsWith('blob:')) {
        URL.revokeObjectURL(removed.preview);
      }
      return newImages;
    });
  };

  const removeExistingImage = async (imageId: string) => {
    try {
      // Buscar la imagen para obtener la URL y extraer el nombre del archivo
      const imageToDelete = existingImages.find(img => img.id === imageId);
      
      if (!imageToDelete) {
        throw new Error('Imagen no encontrada');
      }

      // Extraer el nombre del archivo de la URL
      // La URL es algo como: https://xxx.supabase.co/storage/v1/object/public/product-images/filename.png
      const urlParts = imageToDelete.src.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Eliminar del storage primero (las políticas RLS permiten a usuarios autenticados eliminar)
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([fileName]);

      if (storageError) {
        console.warn('Error deleting from storage:', storageError);
        // Continuar aunque falle la eliminación del storage
      }

      // Eliminar de la tabla multimedia
      const { error } = await supabase
        .from('multimedia')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Imagen eliminada');
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  const uploadImagesToStorage = async (productId: string, imageFiles: ImageFile[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const imageFile of imageFiles) {
      try {
        // Generar nombre único para el archivo
        const fileExt = imageFile.file.name.split('.').pop();
        const fileName = `${productId}_${generateUUID()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Subir a Supabase Storage (las políticas RLS permiten a usuarios autenticados subir)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      } catch (error: any) {
        console.error('Error uploading image:', error);
        throw new Error(`Error al subir la imagen ${imageFile.file.name}: ${error.message}`);
      }
    }

    return uploadedUrls;
  };

  const saveMultimediaRecords = async (productId: string, imageUrls: string[], altText: string) => {
    const multimediaRecords = imageUrls.map((url, index) => ({
      id: generateUUID(),
      alt: altText || `Imagen ${index + 1} del producto`,
      src: url,
      id_product: productId,
    }));

    const { error } = await supabase
      .from('multimedia')
      .insert(multimediaRecords);

    if (error) throw error;
  };

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setUploadingImages(true);

    try {
      let productId: string;

      if (product) {
        // Actualizar producto existente
        productId = product.id;

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

        // Subir nuevas imágenes si hay
        if (images.length > 0) {
          const imageUrls = await uploadImagesToStorage(productId, images);
          await saveMultimediaRecords(productId, imageUrls, data.name);
        }

        toast.success('Producto actualizado exitosamente');
      } else {
        // Crear nuevo producto
        productId = generateUUID();

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

        // Subir imágenes si hay
        if (images.length > 0) {
          const imageUrls = await uploadImagesToStorage(productId, images);
          await saveMultimediaRecords(productId, imageUrls, data.name);
        }

        toast.success('Producto creado exitosamente');
      }

      // Limpiar previews
      images.forEach(img => {
        if (img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
      setUploadingImages(false);
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

          {/* Sección de imágenes */}
          <div className="space-y-2">
            <Label>Imágenes del Producto</Label>
            <div className="space-y-4">
              {/* Imágenes existentes (solo al editar) */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Imágenes actuales:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingImage(img.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nuevas imágenes seleccionadas */}
              {images.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Nuevas imágenes:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón para seleccionar imágenes */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="product-images"
                  disabled={loading}
                />
                <Label
                  htmlFor="product-images"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                    "hover:bg-secondary/50 border-border",
                    loading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Haz clic para subir</span> o arrastra imágenes aquí
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF hasta 5MB
                    </p>
                  </div>
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || uploadingImages}>
              {loading || uploadingImages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadingImages ? 'Subiendo imágenes...' : 'Guardando...'}
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

