import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { User, Phone, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const ROLES = {
  CUSTOMER: 2,
  VENDOR: 3,
} as const;

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  lastname: z
    .string()
    .trim()
    .min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  cell: z
    .string()
    .trim()
    .min(10, { message: "El celular debe tener al menos 10 dígitos" })
    .max(12, { message: "El celular no debe exceder 12 dígitos" }),
  roleId: z.number().min(2).max(3),
});

export default function CompleteProfile() {
  const navigate = useNavigate();
  const {
    user,
    isLoading: authLoading,
    needsProfileCompletion,
    checkProfileCompletion,
  } = useAuth();

  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [cell, setCell] = useState("");
  const [roleId, setRoleId] = useState<number>(ROLES.CUSTOMER);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!authLoading && user && !needsProfileCompletion) {
      navigate("/");
      return;
    }

    // Pre-fill con metadata de Google, si existe

  }, [user, authLoading, needsProfileCompletion, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = profileSchema.safeParse({
      name,
      lastname,
      cell,
      roleId,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    if (!user) {
      toast.error("Error de autenticación. Intenta de nuevo.");
      navigate("/auth");
      return;
    }

    setIsLoading(true);

    try {
      // Insertamos en public.user dejando que el serial genere el id
      console.log(user);
      
      const { error: userError } = await supabase.from("user").insert({
        name,
        lastname,
        email: user.email,
        cell,
        uuid: user.id, 
        role_id: roleId,
      });

      if (userError) {
        console.error("Error inserting user:", userError);
        toast.error("Error al guardar la información. Intenta de nuevo.");
        setIsLoading(false);
        return;
      }

      // Actualizamos el flag de perfil completo en el contexto
      await checkProfileCompletion(user.id);

      // Verificar si hay una intención de checkout pendiente
      const pendingCheckout = localStorage.getItem('pendingCheckout');
      
      toast.success("¡Perfil completado exitosamente!");
      navigate("/");
      
      // Si hay checkout pendiente, abrir el carrito después de un pequeño delay
      if (pendingCheckout === 'true') {
        localStorage.removeItem('pendingCheckout');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('openCartAfterAuth'));
        }, 500);
      }
    } catch (error) {
      console.error("Error completing profile:", error);
      toast.error("Error al completar el perfil.");
    }

    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background px-4 py-12">
      <Link
        to="/"
        className="mb-8 font-display text-4xl font-bold tracking-tight text-foreground"
      >
        <span className="text-primary">BOGO</span>
        <span>GO</span>
      </Link>

      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Últimos Pasos</CardTitle>
          <CardDescription>
            Completa tu perfil para empezar a usar Bogogo
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Apellido</Label>
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Pérez"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cell">Número de Celular</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="cell"
                  type="tel"
                  placeholder="3001234567"
                  className="pl-10"
                  value={cell}
                  onChange={(e) =>
                    setCell(e.target.value.replace(/\D/g, ""))
                  }
                  maxLength={12}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>¿Cómo deseas usar Bogogo?</Label>
              <RadioGroup
                value={roleId.toString()}
                onValueChange={(value) => setRoleId(parseInt(value))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem
                    value={ROLES.CUSTOMER.toString()}
                    id="role-customer"
                  />
                  <Label
                    htmlFor="role-customer"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">Comprador</div>
                    <div className="text-sm text-muted-foreground">
                      Quiero comprar productos de moda
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <RadioGroupItem
                    value={ROLES.VENDOR.toString()}
                    id="role-vendor"
                  />
                  <Label
                    htmlFor="role-vendor"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">Vendedor</div>
                    <div className="text-sm text-muted-foreground">
                      Quiero vender mis productos
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Completar Perfil"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
