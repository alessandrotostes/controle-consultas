"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";

// A interface define as propriedades que o componente recebe
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname(); // Hook para saber a URL atual

  // Classes base para os links
  const linkClasses = "flex items-center p-2 rounded-md transition-colors";
  // Classes para o link da página ativa
  const activeClasses = "bg-blue-600/30 text-white";
  // Classes para os links inativos
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <>
      {/* Fundo escuro para o modo mobile */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* O menu lateral */}
      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-gray-900 text-white flex flex-col p-4 shadow-lg z-40 transform transition-transform md:relative md:translate-x-0
                   ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold">Gestão App</h1>
          {/* Botão de fechar para mobile */}
          <button onClick={onClose} className="md:hidden p-2">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav>
          <ul>
            <li className="mb-2">
              <Link
                href="/"
                onClick={onClose}
                className={`${linkClasses} ${
                  pathname === "/" ? activeClasses : inactiveClasses
                }`}
              >
                <span className="mr-3">📊</span>
                Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/pacientes"
                onClick={onClose}
                className={`${linkClasses} ${
                  pathname.startsWith("/pacientes")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <span className="mr-3">👥</span>
                Pacientes
              </Link>
            </li>
          </ul>
        </nav>

        {/* Seção do Perfil completa */}
        <div className="mt-auto">
          <div className="flex items-center p-2 border-t border-gray-700">
            <span className="mr-3">👤</span>
            <div>
              <p className="font-semibold">Tauana Pavanelli</p>
              <p className="text-sm text-gray-400">Psicanalista</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
