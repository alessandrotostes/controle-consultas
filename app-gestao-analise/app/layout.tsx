"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Gestão App</title>
      </head>
      <body className={`${inter.className} bg-gray-800 text-gray-200`}>
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
        <Toaster
          position="bottom-right"
          toastOptions={{ style: { background: "#333", color: "#fff" } }}
        />
      </body>
    </html>
  );
}
