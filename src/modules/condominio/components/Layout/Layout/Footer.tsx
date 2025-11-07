'use client';
import { useTheme } from '@/modules/condominio';
import { getThemeClasses } from '@/shared';
import { FaPuzzlePiece, FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export default function Footer() {
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);

  return (
    <footer className={`${theme.cardBg} border-t ${theme.border} mt-8`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo e Copyright */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mr-2">
                <FaPuzzlePiece className="text-white text-sm" />
              </div>
              <h3 className={`font-bold ${theme.text}`}>CentralCondo</h3>
            </div>
            <span className={`${theme.textSecondary} text-sm`}>© 2024</span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <a href="/dashboard" className={`${theme.textSecondary} hover:${theme.text} transition-colors text-sm`}>Dashboard</a>
            <a href="/projects" className={`${theme.textSecondary} hover:${theme.text} transition-colors text-sm`}>Projetos</a>
            <a href="#" className={`${theme.textSecondary} hover:${theme.text} transition-colors text-sm`}>Ajuda</a>
          </div>

          {/* Redes Sociais */}
          <div className="flex space-x-3">
            <a href="#" className={`${theme.textSecondary} hover:text-blue-500 transition-colors`}>
              <FaGithub className="w-4 h-4" />
            </a>
            <a href="#" className={`${theme.textSecondary} hover:text-blue-500 transition-colors`}>
              <FaLinkedin className="w-4 h-4" />
            </a>
            <a href="#" className={`${theme.textSecondary} hover:text-blue-500 transition-colors`}>
              <FaEnvelope className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}