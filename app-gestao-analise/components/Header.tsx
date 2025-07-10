// components/Header.tsx
"use client";

import { Bars3Icon } from "@heroicons/react/24/outline";

interface HeaderProps {
  onMenuButtonClick: () => void;
}

export default function Header({ onMenuButtonClick }: HeaderProps) {
  return (
    // A classe 'md:hidden' faz este componente aparecer APENAS em telas pequenas
    <header className="md:hidden bg-gray-900 p-4 flex items-center justify-between shadow-md">
      <h1 className="text-xl font-bold text-white">Gestão App</h1>
      <button
        onClick={onMenuButtonClick}
        className="text-white p-2 rounded-md hover:bg-gray-700"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>
    </header>
  );
}
