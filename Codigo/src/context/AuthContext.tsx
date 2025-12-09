import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: AppRole | null;
  isLoading: boolean; // auth + perfil + rol en proceso
  needsProfileCompletion: boolean | null; // null = aún no calculado
  signUp: (
    email: string,
    password: string,
    name: string,
    lastname: string
  ) => Promise<{ error: Error | null; userId: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkProfileCompletion: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsProfileCompletion, setNeedsProfileCompletion] =
    useState<boolean | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // 🔹 Rol: se lee desde public.user.role_id usando el uuid (auth.users.id)
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user") // public.user
        .select("role_id")
        .eq("uuid", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        setUserRole("comprador");
        return;
      }

      if (!data || data.role_id == null) {
        setUserRole("comprador");
        return;
      }

      const roleMap: Record<number, AppRole> = {
        1: "administrador",
        2: "comprador",
        3: "vendedor",
      };

      setUserRole(roleMap[data.role_id] ?? "comprador");
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUserRole("comprador");
    }
  };

  // 🔹 Perfil completo: existe fila en public.user con uuid = auth.users.id
  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user") // public.user
        .select("id")
        .eq("uuid", userId)
        .maybeSingle();

      if (error) {
        console.warn("Error checking profile completion:", error);
      }

      if (!data) {
        // no hay fila → falta completar perfil
        setNeedsProfileCompletion(true);
      } else {
        // sí hay fila → perfil completo
        setNeedsProfileCompletion(false);
      }
    } catch (error) {
      console.error("Error checking profile completion:", error);
      setNeedsProfileCompletion(true);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let isInitialLoad = true;

    // Función para cargar datos del usuario
    const loadUserData = async (userId: string) => {
      try {
        await Promise.all([
          fetchUserRole(userId),
          checkProfileCompletion(userId),
        ]);
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };

    // Verificar sesión inicial
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          currentUserIdRef.current = initialSession?.user?.id ?? null;

          if (initialSession?.user) {
            await loadUserData(initialSession.user.id);
          } else {
            setUserRole(null);
            setNeedsProfileCompletion(null);
          }
        }
      } catch (err) {
        console.error("Error initializing session:", err);
      } finally {
        if (isMounted) {
          isInitialLoad = false;
          setIsLoading(false);
        }
      }
    };

    // Inicializar sesión
    initializeSession();

    // Listener para cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      // No poner loading si es solo un refresh de token y el usuario no cambió
      if (event === 'TOKEN_REFRESHED' && session?.user && currentUserIdRef.current === session.user.id) {
        // Solo actualizar la sesión sin recargar todo
        setSession(session);
        return;
      }

      // Solo poner loading si es un cambio significativo
      const isSignificantChange = 
        event === 'SIGNED_IN' || 
        event === 'SIGNED_OUT' ||
        event === 'USER_UPDATED';

      if (isSignificantChange && !isInitialLoad) {
        setIsLoading(true);
      }

      try {
        setSession(session);
        setUser(session?.user ?? null);
        currentUserIdRef.current = session?.user?.id ?? null;

        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setUserRole(null);
          setNeedsProfileCompletion(null);
        }
      } catch (err) {
        console.error("Error en onAuthStateChange:", err);
      } finally {
        if (isMounted && isSignificantChange) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    lastname: string
  ) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: name,
          last_name: lastname,
        },
      },
    });

    return {
      error: error as Error | null,
      userId: data?.user?.id || null,
    };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    setNeedsProfileCompletion(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        isLoading,
        needsProfileCompletion,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        checkProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
