'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../src/components/Layout/Sidebar';
import Header from '../../src/components/Layout/Header';
import { FaPlus } from 'react-icons/fa';
import { useProjects } from '../../src/hooks/useProjects';

export default function Projects() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  const { projects, loading: projectsLoading, createProject, createTask, updateTask, deleteTask } = useProjects();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedToId: '' });
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [members, setMembers] = useState([]);

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
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || projectsLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createProject(newProject.name, newProject.description);
    if (result.success) {
      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProject) {
      const result = await createTask(selectedProject.id, newTask.title, newTask.description, newTask.assignedToId || undefined);
      if (result.success) {
        setShowTaskModal(false);
        setNewTask({ title: '', description: '', assignedToId: '' });
        // Atualizar o projeto selecionado com a nova tarefa
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          setSelectedProject({...updatedProject});
        }
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
    // Forçar re-render do projeto selecionado
    const updatedProject = projects.find(p => p.id === selectedProject.id);
    if (updatedProject) {
      setSelectedProject({...updatedProject});
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask({ ...task });
    setShowEditModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      const result = await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        assignedToId: editingTask.assignedToId || null
      });
      if (result.success) {
        setShowEditModal(false);
        setEditingTask(null);
        // Forçar re-render do projeto selecionado
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          setSelectedProject({...updatedProject});
        }
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
      const result = await deleteTask(taskId);
      if (result.success) {
        // Forçar re-render do projeto selecionado
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          setSelectedProject({...updatedProject});
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Concluída';
      case 'IN_PROGRESS': return 'Em Progresso';
      case 'PENDING': return 'Pendente';
      default: return 'Indefinido';
    }
  };

  const calculateProgress = (tasks: any[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <div className="ml-20 pt-20 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projetos</h1>
          <p className="text-gray-600 mt-2">Gerencie seus projetos e tarefas</p>
        </div>

        {selectedProject ? (
          <div>
            <button
              onClick={() => setSelectedProject(null)}
              className="mb-4 text-blue-600 hover:text-blue-700 flex items-center"
            >
              ← Voltar aos projetos
            </button>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>
                <button 
                  onClick={() => setShowTaskModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nova Tarefa
                </button>
              </div>
              
              <div className="space-y-4">
                {selectedProject.tasks.map((task: any) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>Responsável: {task.assignedTo?.name || 'Não atribuído'}</span>
                          <span>Criado: {new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span>Por: {task.createdBy?.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(task.status)}`}
                        >
                          <option value="PENDING">Pendente</option>
                          <option value="IN_PROGRESS">Em Progresso</option>
                          <option value="COMPLETED">Concluída</option>
                        </select>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                          >
                            Deletar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => setSelectedProject(project)}>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{calculateProgress(project.tasks)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${calculateProgress(project.tasks)}%`}}></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {project.tasks.length} tarefas
                </div>
              </div>
            ))}
            
            <div 
              onClick={() => setShowCreateModal(true)}
              className="bg-white rounded-lg shadow p-6 border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaPlus className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Novo Projeto</h3>
              <p className="text-gray-600 text-center">Clique para criar um novo projeto</p>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Criar Novo Projeto</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Nova Tarefa</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Atribuir a</label>
                  <select
                    value={newTask.assignedToId}
                    onChange={(e) => setNewTask({...newTask, assignedToId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Não atribuído</option>
                    {members.map((member: any) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Editar Tarefa</h3>
              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Atribuir a</label>
                  <select
                    value={editingTask.assignedToId || ''}
                    onChange={(e) => setEditingTask({...editingTask, assignedToId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Não atribuído</option>
                    {members.map((member: any) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Salvar
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