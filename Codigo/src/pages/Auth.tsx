import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Mail, Lock, User, Phone, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const ROLES = {
  CUSTOMER: 2,
  VENDOR: 3,
} as const;

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

const signupStep1Schema = z
  .object({
    name: z.string().trim().min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    lastname: z.string().trim().min(2, { message: 'El apellido debe tener al menos 2 caracteres' }),
    email: z.string().trim().email({ message: 'Email inválido' }),
    password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

const signupStep2Schema = z.object({
  cell: z
    .string()
    .trim()
    .min(10, { message: 'El celular debe tener al menos 10 dígitos' })
    .max(12, { message: 'El celular no debe exceder 12 dígitos' }),
  roleId: z.number().min(2).max(3),
});

export default function Auth() {
  const navigate = useNavigate();
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    isLoading: authLoading,
    needsProfileCompletion,
  } = useAuth();

  // 👇 nuevo nombre para no mezclar con el isLoading del contexto
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state - Step 1
  const [signupName, setSignupName] = useState('');
  const [signupLastname, setSignupLastname] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Signup form state - Step 2
  const [signupCell, setSignupCell] = useState('');
  const [signupRoleId, setSignupRoleId] = useState<number>(ROLES.CUSTOMER);

  // Temporary user ID for step 2 (uuid de auth.users)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  // 🔹 Redirección centralizada según estado de auth
  useEffect(() => {
    console.log({ user, authLoading, needsProfileCompletion });

    if (authLoading) return; // aún cargando sesión
    if (!user) return; // no hay usuario → se queda en la pantalla de auth
    if (needsProfileCompletion === null) return; // aún calculando

    if (needsProfileCompletion) {
      navigate('/completar-perfil', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, needsProfileCompletion, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = loginSchema.safeParse({
      email: loginEmail,
      password: loginPassword,
    });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Credenciales inválidas. Verifica tu email y contraseña.');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Por favor confirma tu email antes de iniciar sesión.');
      } else {
        toast.error('Error al iniciar sesión. Intenta de nuevo.');
      }
      return;
    }

    toast.success('¡Bienvenido de vuelta!');
    // la redirección la maneja el useEffect según user + needsProfileCompletion
  };

  const handleSignupStep1 = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = signupStep1Schema.safeParse({
      name: signupName,
      lastname: signupLastname,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    const { error, userId } = await signUp(
      signupEmail,
      signupPassword,
      signupName,
      signupLastname,
    );
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        toast.error('Este email ya está registrado. Intenta iniciar sesión.');
      } else {
        toast.error('Error al registrarse. Intenta de nuevo.');
      }
      return;
    }

    if (userId) {
      setPendingUserId(userId);
      setSignupStep(2);
      toast.success('¡Casi listo! Completa los últimos pasos.');
    }
  };

  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = signupStep2Schema.safeParse({
      cell: signupCell,
      roleId: signupRoleId,
    });

    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    if (!pendingUserId) {
      toast.error('Error en el registro. Intenta de nuevo.');
      setSignupStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      // ⚠️ IMPORTANTE: guardar también el uuid de auth.users
      const { error: userError } = await supabase.from('user').insert({
        uuid: pendingUserId,
        name: signupName,
        lastname: signupLastname,
        email: signupEmail,
        cell: signupCell,
        role_id: signupRoleId,
      });

      if (userError) {
        console.error('Error inserting user:', userError);
        toast.error('Error al guardar la información. Intenta de nuevo.');
        setIsSubmitting(false);
        return;
      }

      const roleMap: Record<number, string> = {
        [ROLES.CUSTOMER]: 'comprador',
        [ROLES.VENDOR]: 'vendedor',
      };

      const { error: userRoleError } = await supabase.from('user_roles').upsert({
        user_id: pendingUserId,
        role: roleMap[signupRoleId],
      });

      if (userRoleError) {
        console.error('Error inserting user_roles:', userRoleError);
        toast.error('Error al guardar el rol. Intenta de nuevo.');
        setIsSubmitting(false);
        return;
      }

      toast.success(
        '¡Registro completado! Revisa tu email para confirmar tu cuenta.',
      );
      setActiveTab('login');
      setSignupStep(1);
      resetSignupForm();
    } catch (error) {
      console.error('Error completing signup:', error);
      toast.error('Error al completar el registro.');
    }

    setIsSubmitting(false);
  };

  const resetSignupForm = () => {
    setSignupName('');
    setSignupLastname('');
    setSignupEmail('');
    setSignupPassword('');
    setSignupConfirmPassword('');
    setSignupCell('');
    setSignupRoleId(ROLES.CUSTOMER);
    setPendingUserId(null);
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast.error('Error al iniciar sesión con Google.');
      setIsSubmitting(false);
    }
    // Si no hay error, Supabase redirige y el AuthProvider se encargará del resto.
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
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as 'login' | 'signup');
            setSignupStep(1);
          }}
        >
          <CardHeader className="space-y-1 pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent className="space-y-4">
            {(activeTab === 'login' || signupStep === 1) && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting}
                >
                  {/* SVG Google */}
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continuar con Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      O continúa con email
                    </span>
                  </div>
                </div>
              </>
            )}

            <TabsContent value="login" className="mt-0 space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-0 space-y-4">
              {signupStep === 1 ? (
                <form onSubmit={handleSignupStep1} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nombre</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Juan"
                          className="pl-10"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-lastname">Apellido</Label>
                      <Input
                        id="signup-lastname"
                        type="text"
                        placeholder="Pérez"
                        value={signupLastname}
                        onChange={(e) => setSignupLastname(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">
                      Confirmar Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      <>
                        Continuar
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignupStep2} className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground">
                      Últimos Pasos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Completa tu perfil para continuar
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-cell">Número de Celular</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="signup-cell"
                        type="tel"
                        placeholder="3001234567"
                        className="pl-10"
                        value={signupCell}
                        onChange={(e) =>
                          setSignupCell(e.target.value.replace(/\D/g, ''))
                        }
                        maxLength={12}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>¿Cómo deseas registrarte?</Label>
                    <RadioGroup
                      value={signupRoleId.toString()}
                      onValueChange={(value) =>
                        setSignupRoleId(parseInt(value, 10))
                      }
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

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => setSignupStep(1)}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Completando...
                        </>
                      ) : (
                        'Completar Registro'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
            <p>
              Al continuar, aceptas nuestros{' '}
              <a href="#" className="text-primary hover:underline">
                Términos de Servicio
              </a>{' '}
              y{' '}
              <a href="#" className="text-primary hover:underline">
                Política de Privacidad
              </a>
            </p>
          </CardFooter>
        </Tabs>
      </Card>
    </div>
  );
}
