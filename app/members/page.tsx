'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLayout from '../../src/components/Layout/AppLayout';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getThemeClasses } from '../../src/utils/themeClasses';
import { FaUsers, FaCheckCircle, FaCrown } from 'react-icons/fa';

export default function Members() {
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', accountType: 'USER' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newMemberData, setNewMemberData] = useState<any>(null);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar membros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingMember ? `/api/members/${editingMember.id}` : '/api/members';
      const method = editingMember ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        
        if (!editingMember && result.temporaryPassword) {
          // Novo membro criado - mostrar senha temporária
          setNewMemberData(result);
          setShowPasswordModal(true);
        }
        
        fetchMembers();
        setShowModal(false);
        setEditingMember(null);
        setFormData({ name: '', email: '', accountType: 'USER' });
      }
    } catch (error) {
      console.error('Erro ao salvar membro:', error);
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    setFormData({ name: member.name, email: member.email, accountType: member.accountType });
    setShowModal(true);
  };

  const handleResetPassword = async (member: any) => {
    // amazonq-ignore-next-line
    const securityWord = prompt('Digite a palavra de segurança:');
    if (!securityWord) return;
    
    const newPassword = prompt('Digite a nova senha:');
    if (!newPassword) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          accountType: member.accountType,
          resetPassword: true,
          securityWord,
          newPassword
        })
      });
      
      if (response.ok) {
        alert('Senha redefinida com sucesso!');
        fetchMembers();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      alert('Erro ao redefinir senha');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este membro?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/members/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          fetchMembers();
        }
      } catch (error) {
        console.error('Erro ao remover membro:', error);
      }
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);



  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`${theme.text} text-lg`}>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getRoleColor = (accountType: string) => {
    switch(accountType) {
      case 'ENTERPRISE': return 'bg-purple-500/20 text-purple-400';
      case 'ADM': return 'bg-blue-500/20 text-blue-400';
      case 'USER': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRoleName = (accountType: string) => {
    switch(accountType) {
      case 'ENTERPRISE': return 'Enterprise';
      case 'ADM': return 'Administrador';
      case 'USER': return 'Usuário';
      default: return 'Desconhecido';
    }
  };

  const displayMembers = Array.isArray(members) ? members : [];

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <AppLayout>
        <div className="p-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text}`}>Membros</h1>
          <p className={`${theme.textSecondary} mt-2`}>Gerencie membros e permissões</p>
        </div>

        <div className={`${theme.cardBg} border ${theme.border} rounded-xl`}>
          <div className={`p-6 border-b ${theme.border}`}>
            <div className="flex justify-between items-center">
              <div>
                <h2 className={`text-lg font-semibold ${theme.text}`}>Lista de Membros</h2>
                <p className={`text-sm ${theme.textSecondary}`}>{displayMembers.length} membros cadastrados</p>
              </div>
              {['ENTERPRISE', 'ADM'].includes(user?.accountType || '') && (
                <button 
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Membro
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={theme.secondaryBg}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}>
                    Membro
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}>
                    Contato
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}>
                    Função
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${theme.textSecondary} uppercase tracking-wider`}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className={`${theme.cardBg} divide-y ${theme.border}`}>
                {displayMembers.length > 0 ? displayMembers.map((member) => (
                  <tr key={member.id} className={`${theme.hover} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${theme.text}`}>{member.name}</div>
                          <div className={`text-sm ${theme.textSecondary}`}>{member.apartment || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${theme.text}`}>{member.email}</div>
                      <div className={`text-sm ${theme.textSecondary}`}>{member.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.accountType)}`}>
                        {getRoleName(member.accountType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(member)}
                          className="text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-500/20 transition-all duration-200"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleResetPassword(member)}
                          className="text-yellow-400 hover:text-yellow-300 px-2 py-1 rounded hover:bg-yellow-500/20 transition-all duration-200"
                        >
                          Reset Senha
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/20 transition-all duration-200"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className={`px-6 py-12 text-center ${theme.textSecondary}`}>
                      Nenhum membro encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 hover:border-blue-500/50 transition-all duration-200`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FaUsers className="text-2xl text-blue-400" />
              </div>
              <div className="ml-4">
                <p className={`text-sm ${theme.textSecondary}`}>Total de Membros</p>
                <p className={`text-2xl font-bold ${theme.text}`}>{displayMembers.length}</p>
              </div>
            </div>
          </div>

          <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 hover:border-green-500/50 transition-all duration-200`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <FaCheckCircle className="text-2xl text-green-400" />
              </div>
              <div className="ml-4">
                <p className={`text-sm ${theme.textSecondary}`}>Membros Ativos</p>
                <p className={`text-2xl font-bold ${theme.text}`}>
                  {displayMembers.length}
                </p>
              </div>
            </div>
          </div>

          <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 hover:border-purple-500/50 transition-all duration-200`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <FaCrown className="text-2xl text-purple-400" />
              </div>
              <div className="ml-4">
                <p className={`text-sm ${theme.textSecondary}`}>Administradores</p>
                <p className={`text-2xl font-bold ${theme.text}`}>
                  {displayMembers.filter(m => ['ENTERPRISE', 'ADM'].includes(m.accountType)).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
                {editingMember ? 'Editar Membro' : 'Adicionar Membro'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Tipo</label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                  >
                    <option value="USER">Usuário</option>
                    <option value="ADM">Administrador</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingMember(null);
                      setFormData({ name: '', email: '', accountType: 'USER' });
                    }}
                    className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingMember ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showPasswordModal && newMemberData && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4 text-center`}>
                Membro Criado com Sucesso!
              </h3>
              <div className="space-y-4">
                <div className={`${theme.secondaryBg} border ${theme.border} rounded-lg p-4`}>
                  <p className={`text-sm ${theme.textSecondary} mb-2`}>Nome:</p>
                  <p className={`font-medium ${theme.text}`}>{newMemberData.name}</p>
                </div>
                <div className={`${theme.secondaryBg} border ${theme.border} rounded-lg p-4`}>
                  <p className={`text-sm ${theme.textSecondary} mb-2`}>Email:</p>
                  <p className={`font-medium ${theme.text}`}>{newMemberData.email}</p>
                </div>
                <div className={`bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4`}>
                  <p className={`text-sm text-yellow-600 mb-2 font-medium`}>Senha Temporária:</p>
                  <p className={`font-bold text-lg text-yellow-700 bg-yellow-100 px-3 py-2 rounded text-center`}>
                    temp123
                  </p>
                  <p className={`text-xs text-yellow-600 mt-2`}>
                    ⚠️ Anote esta senha! O usuário deve alterá-la no primeiro login.
                  </p>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewMemberData(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </AppLayout>
    </div>
  );
}
