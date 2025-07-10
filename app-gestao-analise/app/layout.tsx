import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gestão App",
  description:
    "Aplicativo de Gestão e Análise de Sessões para Psicólogos,Psicanalistas, Terapeutas, Nutricionistas e Fisioterapeutas e mais",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} flex bg-gray-800 text-gray-200`}>
        <Sidebar />
        <main className="flex-grow p-8 overflow-auto h-screen">{children}</main>
      </body>
    </html>
  );
}
