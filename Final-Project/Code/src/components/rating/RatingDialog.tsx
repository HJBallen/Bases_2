import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorId: number;
  vendorName: string;
  customerId: number;
  orderId: number;
}

export function RatingDialog({
  open,
  onOpenChange,
  vendorId,
  vendorName,
  customerId,
  orderId,
}: RatingDialogProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('rating').insert({
        id_customer: customerId,
        id_vendor: vendorId,
        value: rating.toString(),
        date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
      });

      if (error) {
        console.error('Error guardando calificación:', error);
        toast.error('Error al guardar la calificación. Intenta nuevamente.');
        return;
      }

      toast.success(`¡Gracias por calificar a ${vendorName}!`);
      onOpenChange(false);
      // Resetear el formulario
      setRating(0);
    } catch (error) {
      console.error('Error inesperado:', error);
      toast.error('Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Resetear solo si no se está enviando
      setTimeout(() => {
        setRating(0);
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Calificar Vendedor</DialogTitle>
          <DialogDescription>
            ¿Cómo fue tu experiencia con {vendorName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Sistema de estrellas */}
          <div className="space-y-4">
            <Label className="text-base">Calificación</Label>
            <div className="flex items-center justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  disabled={isSubmitting}
                >
                  <Star
                    className={cn(
                      'h-10 w-10 transition-colors',
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200',
                      isSubmitting && 'opacity-50 cursor-not-allowed'
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-base font-medium text-muted-foreground">
                  {rating} {rating === 1 ? 'estrella' : 'estrellas'}
                </span>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Enviar Calificación'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

