// app/layout.tsx

// A diretiva "use client" NÃO deve estar aqui.

import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./auth/AuthContext";
import { Toaster } from "react-hot-toast";
import { AppContent } from "@/components/AppContent";
import type { Metadata, Viewport } from "next"; // Importe Viewport

const inter = Inter({ subsets: ["latin"] });

// CORRIGIDO: Metadata e Viewport separados
export const metadata: Metadata = {
  title: "Gestão App",
  description: "Gerado pelo Next.js",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // O resto do seu arquivo continua igual...
  return (
    <html lang="pt-BR">
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
