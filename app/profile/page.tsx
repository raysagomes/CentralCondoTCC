'use client';
import { useAuth } from '@/modules/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLayout from '@/modules/condominio/components/Layout/AppLayout';
import { useTheme, useStats } from '@/modules/condominio';
import { getThemeClasses } from '@/shared';

export default function Profile() {
  const { isAuthenticated, loading, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const theme = getThemeClasses(isDark);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    company: '',
    position: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { stats, loading: statsLoading, refetch } = useStats();

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        company: user.company || '',
        position: user.position || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsEditing(false);
        // Atualizar dados do usuário
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Senha alterada com sucesso!');
      } else {
        alert('Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
    }
  };



  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || statsLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`${theme.text} text-lg`}>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <AppLayout>
        <div className="p-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text}`}>Perfil</h1>
          <p className={`${theme.textSecondary} mt-2`}>Gerencie suas informações pessoais</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Principal do Perfil */}
          <div className={`lg:col-span-2 ${theme.cardBg} border ${theme.border} rounded-xl p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${theme.text}`}>Informações Pessoais</h3>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Salvar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mr-6">
                <span className="text-3xl font-bold text-blue-400">
                  {formData.name.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${theme.text}`}>{formData.name || 'Usuário'}</h2>
                <p className={theme.textSecondary}>{formData.position || 'Cargo não informado'}</p>
                <p className={`text-sm ${theme.textSecondary}`}>{formData.company || 'Empresa não informada'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Nome</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none ${theme.input}`}
                  />
                ) : (
                  <p className={`${theme.text} py-2`}>{formData.name || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none ${theme.input}`}
                  />
                ) : (
                  <p className={`${theme.text} py-2`}>{formData.email || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Telefone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none ${theme.input}`}
                  />
                ) : (
                  <p className={`${theme.text} py-2`}>{formData.phone || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Empresa</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none ${theme.input}`}
                  />
                ) : (
                  <p className={`${theme.text} py-2`}>{formData.company || 'Não informado'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Cargo</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none ${theme.input}`}
                  />
                ) : (
                  <p className={`${theme.text} py-2`}>{formData.position || 'Não informado'}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Bio</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none ${theme.input}`}
                    rows={3}
                  />
                ) : (
                  <p className={`${theme.text} py-2`}>{formData.bio || 'Nenhuma descrição adicionada'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar com Estatísticas e Ações */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Estatísticas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className={theme.textSecondary}>Projetos</span>
                  <span className="text-blue-400 font-semibold">{stats.projectsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme.textSecondary}>Tarefas Concluídas</span>
                  <span className="text-green-400 font-semibold">{stats.tasksCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme.textSecondary}>Eventos Criados</span>
                  <span className="text-purple-400 font-semibold">{stats.eventsCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme.textSecondary}>Membro desde</span>
                  <span className={`${theme.text} font-semibold`}>{stats.memberSince || 'N/A'}</span>
                </div>
              </div>
            </div>



            {/* Ações de Segurança */}
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Segurança</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Alterar Senha
                </button>
                <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Desativar Conta
                </button>
              </div>
            </div>

            {/* Preferências */}
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Preferências</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={theme.textSecondary}>Notificações por Email</span>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className={theme.textSecondary}>Modo Escuro</span>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDark ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDark ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Alterar Senha */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Alterar Senha</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Senha Atual</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0f1136] border border-[#2a2d6f] rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0f1136] border border-[#2a2d6f] rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 bg-[#0f1136] border border-[#2a2d6f] rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Alterar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        </div>
      </AppLayout>
    </div>
  );
}