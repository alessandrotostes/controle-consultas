// components/AppContent.tsx
"use client"; // A diretiva "use client" fica AQUI agora.

import { useAuth } from "@/app/auth/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AppContent({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === "/login";

    if (!session && !isAuthPage) {
      router.push("/login");
    }

    if (session && isAuthPage) {
      router.push("/");
    }
  }, [session, loading, router, pathname]);

  // Enquanto carrega ou se o redirecionamento ainda não aconteceu,
  // renderiza uma tela de carregamento ou a própria página de login.
  if (loading || (!session && pathname !== "/login")) {
    // Para a página de login, permite que os children (a página de login) sejam renderizados.
    if (pathname === "/login") {
      return <>{children}</>;
    }
    // Para outras páginas, mostra um carregamento centralizado.
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  // Se o usuário está logado e não está na página de login, mostra o layout completo do app.
  if (session && pathname !== "/login") {
    return (
      <div className="flex h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex flex-col flex-grow w-full">
          <Header onMenuButtonClick={() => setIsSidebarOpen(true)} />
          <main className="flex-grow p-4 md:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Se o usuário está logado, mas a página é a de login, permite a renderização
  // para que o useEffect possa redirecionar.
  if (session && pathname === "/login") {
    return <>{children}</>;
  }

  return null; // Caso de fallback
}
