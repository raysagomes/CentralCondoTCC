'use client';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FaUser, FaBell, FaSignOutAlt } from 'react-icons/fa';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notifications] = useState(3); // Mock notifications count

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <header className="fixed top-0 left-20 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div className="px-6 py-4">
        <div className="flex justify-end items-center space-x-4">
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <FaUser className="text-gray-600" />
            </button>
            
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    router.push('/profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Ver Perfil
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <FaBell className="text-gray-600" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors group"
            title="Sair"
          >
            <FaSignOutAlt className="text-gray-600 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </header>
  );
}