// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "@/utils/supabaseClient";
import { useAuth } from "@/app/auth/AuthContext"; // Importamos o useAuth

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth(); // Pegamos os dados do usuário logado

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login"); // Redireciona para o login após sair
  };

  const linkClasses = "flex items-center p-2 rounded-md transition-colors";
  const activeClasses = "bg-blue-600/30 text-white";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-gray-900 text-white flex flex-col p-4 shadow-lg z-40 transform transition-transform md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold">Gestão App</h1>
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
                <span className="mr-3">📊</span> Dashboard
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
                <span className="mr-3">👥</span> Pacientes
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-auto">
          {/* Mostra o email do usuário logado */}
          <div className="flex items-center p-2 border-t border-gray-700 min-w-0">
            {" "}
            {/* Adicionado min-w-0 */}
            <span className="mr-3 flex-shrink-0">👤</span>
            <div className="flex-grow min-w-0">
              {" "}
              {/* Adicionado flex-grow e min-w-0 */}
              <p
                className="font-semibold text-sm truncate" // A mágica está aqui!
                title={user?.email || "Usuário"}
              >
                {user?.email}
              </p>
            </div>
          </div>
          {/* Botão Sair */}
          <button
            onClick={handleLogout}
            className={`${linkClasses} ${inactiveClasses} w-full mt-2`}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
