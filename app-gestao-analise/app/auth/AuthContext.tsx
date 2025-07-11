// app/auth/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/utils/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

// Define o formato do nosso contexto
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

// Cria o contexto com um valor padrão
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

// Cria o nosso "Provedor" de autenticação
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuta por mudanças no estado de autenticação (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Limpa o "escutador" quando o componente é desmontado
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Cria um hook customizado para usar nosso contexto facilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
