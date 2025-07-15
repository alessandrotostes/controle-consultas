// app/layout.tsx

// 1. Remova o "use client" do topo deste arquivo.
// O layout principal (RootLayout) DEVE ser um Server Component.

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./auth/AuthContext";
import { Toaster } from "react-hot-toast";
import { AppContent } from "@/components/AppContent"; // 2. Mova a lógica para um novo componente

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gestão App",
  description: "Gerado pelo Next.js",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-800 text-gray-200`}>
        <AuthProvider>
          {/* 3. O AppContent agora envolve os children e contém a lógica do cliente */}
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
