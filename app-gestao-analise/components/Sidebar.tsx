import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4 shadow-lg flex-shrink-0">
      <div className="text-2xl font-bold mb-10 text-center">Gestão App</div>
      <nav>
        <ul>
          <li className="mb-4">
            <Link
              href="/"
              className="flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">📊</span> Dashboard
            </Link>
          </li>
          <li className="mb-4">
            <Link
              href="/pacientes"
              className="flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              <span className="mr-3">👥</span> Pacientes
            </Link>
          </li>
        </ul>
      </nav>
      <div className="mt-auto">
        <div className="flex items-center p-2 border-t border-gray-700">
          <span className="mr-3">👤</span>
          <div>
            <p className="font-semibold"> Nome do Profissional</p>
            <p className="text-sm text-gray-400">Profissão</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
