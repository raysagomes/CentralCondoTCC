'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AppLayout from '../../src/components/Layout/AppLayout';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getThemeClasses } from '../../src/utils/themeClasses';

export default function Avisos() {
  const { isAuthenticated, loading, user } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'NORMAL', authorRole: 'Administração' });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadAnnouncements = () => {
    const saved = localStorage.getItem('announcements');
    if (saved) {
      setAnnouncements(JSON.parse(saved));
    } else {
      const defaultAnnouncements = [
        {
          id: 1,
          title: 'Manutenção do Elevador',
          content: 'Informamos que o elevador social passará por manutenção preventiva no dia 15/01 das 8h às 17h.',
          priority: 'HIGH',
          createdAt: new Date().toISOString(),
          author: { name: 'Administração' }
        },
        {
          id: 2,
          title: 'Reunião de Condomínio',
          content: 'Convocamos todos os condôminos para a reunião ordinária que acontecerá no dia 20/01 às 19h no salão de festas.',
          priority: 'MEDIUM',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          author: { name: 'Síndico' }
        }
      ];
      setAnnouncements(defaultAnnouncements);
      localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      return;
    }
    
    const announcement = {
      id: Date.now(),
      title: newAnnouncement.title.trim(),
      content: newAnnouncement.content.trim(),
      priority: newAnnouncement.priority,
      createdAt: new Date().toISOString(),
      author: { name: newAnnouncement.authorRole }
    };
    
    const updatedAnnouncements = [announcement, ...announcements];
    setAnnouncements(updatedAnnouncements);
    localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    
    setShowModal(false);
    setNewAnnouncement({ title: '', content: '', priority: 'NORMAL', authorRole: 'Administração' });
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated) {
      loadAnnouncements();
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`${theme.text} text-lg`}>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <AppLayout>
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className={`text-3xl font-bold ${theme.text}`}>Mural de Avisos</h1>
              <p className={`${theme.textSecondary} mt-2`}>Comunicados e informações importantes</p>
            </div>
            {user?.accountType === 'COMPANY' && (
              <button 
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Novo Aviso
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((announcement) => (
              <div key={announcement.id} className={`${theme.cardBg} border ${theme.border} p-6 rounded-xl hover:border-orange-500/50 transition-all duration-200 cursor-pointer`}
                   onClick={() => setSelectedAnnouncement(announcement)}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className={`font-semibold ${theme.text}`}>{announcement.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    announcement.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                    announcement.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.priority === 'HIGH' ? 'Alta' :
                     announcement.priority === 'MEDIUM' ? 'Média' : 'Normal'}
                  </span>
                </div>
                <p className={`${theme.textSecondary} text-sm mb-4 line-clamp-3`}>{announcement.content}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className={theme.textSecondary}>
                    {new Date(announcement.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className={theme.textSecondary}>
                    Por: {announcement.author?.name || 'Sistema'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {announcements.length === 0 && (
            <div className={`text-center py-16 ${theme.textSecondary}`}>
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum aviso encontrado</h3>
              <p>Não há avisos publicados no momento.</p>
            </div>
          )}

          {/* Paginação */}
          {announcements.length > itemsPerPage && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === 1 
                    ? `${theme.textSecondary} cursor-not-allowed` 
                    : `${theme.text} ${theme.secondaryBg} border ${theme.border} hover:${theme.hover}`
                }`}
              >
                Anterior
              </button>
              
              <span className={`${theme.text}`}>
                Página {currentPage} de {Math.ceil(announcements.length / itemsPerPage)}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(announcements.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(announcements.length / itemsPerPage)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === Math.ceil(announcements.length / itemsPerPage)
                    ? `${theme.textSecondary} cursor-not-allowed`
                    : `${theme.text} ${theme.secondaryBg} border ${theme.border} hover:${theme.hover}`
                }`}
              >
                Próxima
              </button>
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
                <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Criar Novo Aviso</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Título</label>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                      className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-green-500 ${theme.text}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Conteúdo</label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                      className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-green-500 ${theme.text}`}
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Prioridade</label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                      className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-green-500 ${theme.text}`}
                    >
                      <option value="NORMAL">Normal</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                    </select>
                  </div>
                  {user?.accountType === 'COMPANY' && (
                    <div>
                      <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Assinar como</label>
                      <select
                        value={newAnnouncement.authorRole}
                        onChange={(e) => setNewAnnouncement({...newAnnouncement, authorRole: e.target.value})}
                        className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-green-500 ${theme.text}`}
                      >
                        <option value="Administração">Administração</option>
                        <option value="Síndico">Síndico</option>
                      </select>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Criar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {selectedAnnouncement && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96 max-w-lg`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-lg font-semibold ${theme.text}`}>{selectedAnnouncement.title}</h3>
                  <button 
                    onClick={() => setSelectedAnnouncement(null)}
                    className={`${theme.textSecondary} hover:${theme.text}`}
                  >
                    ✕
                  </button>
                </div>
                <p className={`${theme.text} mb-4`}>{selectedAnnouncement.content}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className={theme.textSecondary}>
                    {new Date(selectedAnnouncement.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className={theme.textSecondary}>
                    Por: {selectedAnnouncement.author?.name || 'Sistema'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </div>
  );
}