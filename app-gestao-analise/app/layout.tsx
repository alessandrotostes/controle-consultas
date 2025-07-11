// app/layout.tsx
"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "./auth/AuthContext"; // 1. Importamos o hook useAuth
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useState, useEffect } from "react"; // 2. Importamos o useEffect
import { Toaster } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation"; // 3. Importamos useRouter e usePathname

const inter = Inter({ subsets: ["latin"] });

// Componente Interno que contém a lógica de proteção
function AppContent({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Não faz nada enquanto o estado de autenticação está sendo carregado
    if (loading) return;

    // Se não há sessão (usuário não logado) E a página atual não é a de login, redireciona para o login
    if (!session && pathname !== "/login") {
      router.push("/login");
    }

    // Se HÁ sessão (usuário logado) E a página atual é a de login, redireciona para o Dashboard
    if (session && pathname === "/login") {
      router.push("/");
    }
  }, [session, loading, router, pathname]);

  // Se estiver carregando ou se o usuário não estiver logado, não mostramos o layout principal
  if (loading || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        {/* Mostra o formulário de login ou uma tela de carregamento */}
        {pathname === "/login" ? (
          children
        ) : (
          <p className="text-white">Carregando...</p>
        )}
      </div>
    );
  }

  // Se o usuário está logado, mostra o layout completo do app
  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-col flex-grow w-full">
        <Header onMenuButtonClick={() => setIsSidebarOpen(true)} />
        <main className="flex-grow p-4 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

// O RootLayout agora apenas envolve tudo com o Provedor de Autenticação
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Gestão App</title>
      </head>
      <body className={`${inter.className} bg-gray-800 text-gray-200`}>
        <AuthProvider>
          <AppContent>{children}</AppContent>
          <Toaster
            position="bottom-right"
            toastOptions={{ style: { background: "#333", color: "#fff" } }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
