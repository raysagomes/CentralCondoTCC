'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../src/components/Layout/Sidebar';
import Header from '../../src/components/Layout/Header';

export default function Members() {
  const { isAuthenticated} = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', accountType: 'USER' });

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

  const mockMembers = [
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@email.com',
      role: 'admin',
      apartment: 'Apto 101',
      phone: '(11) 99999-9999',
      joinDate: '2023-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@email.com',
      role: 'member',
      apartment: 'Apto 205',
      phone: '(11) 88888-8888',
      joinDate: '2023-03-20',
      status: 'active'
    },
    {
      id: 3,
      name: 'Pedro Lima',
      email: 'pedro@email.com',
      role: 'member',
      apartment: 'Apto 304',
      phone: '(11) 77777-7777',
      joinDate: '2023-06-10',
      status: 'inactive'
    },
    {
      id: 4,
      name: 'Ana Costa',
      email: 'ana@email.com',
      role: 'moderator',
      apartment: 'Apto 402',
      phone: '(11) 66666-6666',
      joinDate: '2023-02-28',
      status: 'active'
    }
  ];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getRoleColor = (accountType: string) => {
    return accountType === 'COMPANY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getRoleName = (accountType: string) => {
    return accountType === 'COMPANY' ? 'Empresa' : 'Usuário';
  };

  const displayMembers = members.length > 0 ? members : mockMembers;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <div className="ml-20 pt-20 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Membros</h1>
          <p className="text-gray-600 mt-2">Gerencie membros e permissões</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Lista de Membros</h2>
                <p className="text-sm text-gray-600">{displayMembers.length} membros cadastrados</p>
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar Membro
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.apartment || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      <div className="text-sm text-gray-500">{member.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.accountType || member.role)}`}>
                        {getRoleName(member.accountType || member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total de Membros</p>
                <p className="text-2xl font-bold text-gray-900">{displayMembers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Membros Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayMembers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayMembers.filter(m => (m.accountType || m.role) === 'COMPANY').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">
                {editingMember ? 'Editar Membro' : 'Adicionar Membro'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USER">Usuário</option>
                    <option value="COMPANY">Empresa</option>
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
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
      </div>
    </div>
  );
}