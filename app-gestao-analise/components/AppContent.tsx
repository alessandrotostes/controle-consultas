// components/AppContent.tsx
"use client";

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
    // Não faz nada enquanto o estado de autenticação está sendo carregado
    if (loading) return;

    const isLoginPage = pathname === "/login";

    // Se não há sessão (usuário não logado) E a página atual NÃO é a de login, redireciona para o login
    if (!session && !isLoginPage) {
      router.push("/login");
    }

    // Se HÁ sessão (usuário logado) E a página atual é a de login, redireciona para o Dashboard
    if (session && isLoginPage) {
      router.push("/");
    }
  }, [session, loading, router, pathname]);

  // --- LÓGICA DE RENDERIZAÇÃO CORRIGIDA ---

  const isLoginPage = pathname === "/login";

  // 1. Enquanto a sessão está sendo verificada, mostramos uma tela de carregamento.
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Carregando sessão...</p>
      </div>
    );
  }

  // 2. Se o usuário ESTÁ logado, mostramos o layout principal do aplicativo.
  if (session) {
    // Se ele estiver na página de login, o useEffect acima já vai redirecioná-lo.
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

  // 3. Se o usuário NÃO está logado E está na página de login, mostramos a página de login.
  if (!session && isLoginPage) {
    return <>{children}</>;
  }

  // 4. Se o usuário NÃO está logado e NÃO está na página de login, o useEffect está
  //    redirecionando. Mostramos uma tela de espera para evitar piscar conteúdo.
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <p className="text-white">Redirecionando...</p>
    </div>
  );
}
