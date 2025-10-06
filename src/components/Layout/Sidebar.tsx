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
    <div className="fixed left-0 top-0 h-full w-20 bg-white shadow-lg flex flex-col items-center py-6 z-50">
      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-8">
        <FaPuzzlePiece className="text-white text-xl" />
      </div>
      
      <nav className="flex-1 flex flex-col space-y-4">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors group relative ${
              pathname === item.path 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={item.label}
          >
            <item.icon className="text-xl" />
            <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.label}
            </div>
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-100 text-red-600 transition-colors group relative"
        title="Sair"
      >
        <FaDoorOpen className="text-xl" />
        <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
          Sair
        </div>
      </button>
    </div>
  );
}