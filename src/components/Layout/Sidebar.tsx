'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaProjectDiagram, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaUsers, 
  FaUser, 
  FaDoorOpen,
  FaPuzzlePiece 
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const menuItems = [
  { icon: MdDashboard, path: '/dashboard', label: 'Dashboard' },
  { icon: FaProjectDiagram, path: '/projects', label: 'Projetos' },
  { icon: FaCalendarAlt, path: '/calendar', label: 'Calendário' },
  { icon: FaMoneyBillWave, path: '/payments', label: 'Pagamentos' },
  { icon: FaUsers, path: '/members', label: 'Membros' },
  { icon: FaUser, path: '/profile', label: 'Perfil' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-20 bg-[#1a1d4f] border-r border-[#2a2d6f] shadow-2xl flex flex-col items-center py-6 z-50">
      {/* Logo Principal - Sempre com fundo */}
      <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg hover:bg-blue-700 transition-colors cursor-pointer">
        <FaPuzzlePiece className="text-white text-2xl" />
      </div>
      
      {/* Menu Items */}
      <nav className="flex-1 flex flex-col space-y-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg scale-110' 
                  : 'bg-[#0f1136] text-gray-400 hover:bg-[#2a2d6f] hover:text-white hover:scale-105'
              }`}
              title={item.label}
            >
              <item.icon className="text-2xl" />
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl pointer-events-none z-50">
                {item.label}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Avatar do Usuário no final */}
      <div className="mt-auto">
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-gray-600 transition-colors border-2 border-gray-600">
          N
        </div>
      </div>
    </div>
  );
}
