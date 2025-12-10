import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AppRole } from '@/types/auth';

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
    lastname: string,
  ) => Promise<{ error: Error | null; userId: string | null }>;
  signIn: (
    email: string,
    password: string,
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

  // ----------- Carga de rol -------------
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user')
        .select('role_id')
        .eq('uuid', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('comprador');
        return;
      }

      if (!data || data.role_id == null) {
        setUserRole('comprador');
        return;
      }

      const roleMap: Record<number, AppRole> = {
        1: 'administrador',
        2: 'comprador',
        3: 'vendedor',
      };

      setUserRole(roleMap[data.role_id] ?? 'comprador');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('comprador');
    }
  };

  // ----------- Carga de perfil -------------
  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user')
        .select('id')
        .eq('uuid', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error checking profile completion:', error);
      }

      if (!data) {
        setNeedsProfileCompletion(true);
      } else {
        setNeedsProfileCompletion(false);
      }
    } catch (error) {
      console.error('Error checking profile completion:', error);
      // En caso de error de red, mejor dejarlo en null
      setNeedsProfileCompletion(null);
    }
  };

  // ----------- Efecto 1: conectar con Supabase (user + session) -------------
  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        setIsLoading(true);

        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        currentUserIdRef.current = initialSession?.user?.id ?? null;
      } catch (err) {
        console.error('Error initializing session:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      // Solo sincronizamos user + session aquí.
      // NO hacemos consultas a la BD en este callback.
      console.log('[onAuthStateChange]', event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      currentUserIdRef.current = session?.user?.id ?? null;
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ----------- Efecto 2: cada vez que cambie user.id, cargo rol + perfil -------------
  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      // Si no hay user => limpiar rol y estado de perfil
      if (!user) {
        setUserRole(null);
        setNeedsProfileCompletion(null);
        return;
      }

      setIsLoading(true);
      try {
        await Promise.all([
          fetchUserRole(user.id),
          checkProfileCompletion(user.id),
        ]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // 👈 solo cuando realmente cambia el usuario

  // ----------- Métodos de auth -------------
  const signUp = async (
    email: string,
    password: string,
    name: string,
    lastname: string,
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
      provider: 'google',
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
