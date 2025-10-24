import { ReactNode } from "react";

interface SidebarItem {
  icon: ReactNode;
  tooltip: string;
}

interface SidebarProps {
  items: SidebarItem[];
}

export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-[#1a1d4f] border-r border-[#2a2d6f] flex flex-col items-center py-6 space-y-6 z-50">
      {/* Primeiro item - botão principal (Home) */}
      <div className="mb-4">
        <button className="bg-blue-600 rounded-full p-4 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
          <div className="text-white flex items-center justify-center">
            {items[0]?.icon}
          </div>
        </button>
      </div>

      {/* Demais itens do menu */}
      <nav className="flex flex-col space-y-4 flex-1">
        {items.slice(1).map((item, index) => (
          <button
            key={index}
            className="group relative p-4 rounded-xl text-gray-400 hover:bg-[#2a2d6f] hover:text-white transition-all duration-200"
            title={item.tooltip}
          >
            {item.icon}
            
            {/* Tooltip que aparece ao passar o mouse */}
            <span className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl">
              {item.tooltip}
            </span>
          </button>
        ))}
      </nav>

      {/* Avatar do usuário no final */}
      <div className="mt-auto">
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-gray-600 transition-colors border-2 border-gray-600">
          MC
        </div>
      </div>
    </aside>
  );
}