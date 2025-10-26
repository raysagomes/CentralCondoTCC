'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLayout from '../../src/components/Layout/AppLayout';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getThemeClasses } from '../../src/utils/themeClasses';
import { FaPlus } from 'react-icons/fa';
import { useProjects } from '../../src/hooks/useProjects';

export default function Projects() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  const { projects, loading: projectsLoading, createProject, createTask, updateTask, deleteTask } = useProjects();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedToId: '' });
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [members, setMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState({ name: '', description: '', memberIds: [] });

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

  const fetchProjectMembers = async (projectId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProjectMembers(data);
      }
    } catch (error) {
      console.error('Erro ao buscar membros do projeto:', error);
    }
  };

  const fetchComments = async (taskId: string) => {
    setLoadingComments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTaskForComments) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${selectedTaskForComments.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });
      
      if (response.ok) {
        setNewComment('');
        fetchComments(selectedTaskForComments.id);
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    }
  };

  const handleShowComments = (task: any) => {
    setSelectedTaskForComments(task);
    setShowCommentsModal(true);
    fetchComments(task.id);
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
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`${theme.text} text-lg`}>Carregando...</div>
      </div>
    );
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
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          setSelectedProject({...updatedProject});
        }
      }
    }
  };

  const handleQuickCreateTask = async () => {
    if (selectedProject) {
      const taskNumber = selectedProject.tasks.length + 1;
      const result = await createTask(
        selectedProject.id, 
        `Nova Tarefa ${taskNumber}`, 
        'Descrição da tarefa', 
        undefined
      );
      if (result.success) {
        window.location.reload();
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
    const updatedProject = projects.find(p => p.id === selectedProject.id);
    if (updatedProject) {
      setSelectedProject({...updatedProject});
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask({ 
      ...task, 
      assignedToId: task.assignedTo?.id || '' 
    });
    setShowEditModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      const result = await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        assignedToId: editingTask.assignedToId || null,
        status: editingTask.status
      });
      if (result.success) {
        setShowEditModal(false);
        setEditingTask(null);
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
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          setSelectedProject({...updatedProject});
        }
      }
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProject)
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setSelectedProject(updatedProject);
        setShowEditProjectModal(false);
        // Atualizar a lista de projetos também
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const calculateProgress = (tasks: any[]) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(task => task.status === 'COMPLETED').length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <AppLayout>
        <div className="p-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme.text}`}>Projetos</h1>
          <p className={`${theme.textSecondary} mt-2`}>Gerencie seus projetos e tarefas</p>
        </div>

        {selectedProject ? (
          <div>
            <button
              onClick={() => setSelectedProject(null)}
              className="mb-4 text-blue-400 hover:text-blue-300 flex items-center"
            >
              ← Voltar aos projetos
            </button>
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${theme.text}`}>{selectedProject.name}</h2>
                  <p className={`${theme.textSecondary}`}>{selectedProject.description}</p>
                  {selectedProject.tasks.length > itemsPerPage && (
                    <span className={`text-xs ${theme.textSecondary} mt-1 block`}>
                      Página {currentPage} de {Math.ceil(selectedProject.tasks.length / itemsPerPage)}
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  {['ENTERPRISE', 'ADM'].includes(user?.accountType || '') && (
                    <>
                      <button 
                        onClick={() => {
                          setEditingProject({
                            name: selectedProject.name,
                            description: selectedProject.description || '',
                            memberIds: selectedProject.members?.map((m: any) => m.userId) || []
                          });
                          setShowEditProjectModal(true);
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Editar Projeto
                      </button>
                      <button 
                        onClick={handleQuickCreateTask}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Nova Tarefa
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedProject.tasks
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((task: any) => (
                  <div key={task.id} className={`${theme.secondaryBg} border ${theme.border} rounded-lg p-4 hover:border-blue-500/50 transition-all duration-200 cursor-pointer`}
                       onClick={() => handleShowComments(task)}>
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status === 'PENDING' ? 'Pendente' : task.status === 'IN_PROGRESS' ? 'Em Progresso' : 'Concluída'}
                      </span>
                      {['ENTERPRISE', 'ADM'].includes(user?.accountType || '') && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                            className="text-blue-400 hover:text-blue-300 text-xs p-1 rounded hover:bg-blue-500/20 transition-all duration-200"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            className="text-red-400 hover:text-red-300 text-xs p-1 rounded hover:bg-red-500/20 transition-all duration-200"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 className={`font-semibold ${theme.text} mb-2 line-clamp-2`}>{task.title}</h3>
                    <div className={`text-xs ${theme.textSecondary} space-y-1`}>
                      <div>👤 {task.assignedTo?.name || 'Não atribuído'}</div>
                      <div>📅 {new Date(task.createdAt).toLocaleDateString('pt-BR')}</div>
                      <div>👨‍💼 {task.createdBy?.name}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedProject.tasks.length > itemsPerPage && (
                <div className="flex justify-center items-center space-x-4 mt-6">
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
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(selectedProject.tasks.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(selectedProject.tasks.length / itemsPerPage)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === Math.ceil(selectedProject.tasks.length / itemsPerPage)
                        ? `${theme.textSecondary} cursor-not-allowed`
                        : `${theme.text} ${theme.secondaryBg} border ${theme.border} hover:${theme.hover}`
                    }`}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 hover:border-purple-500/50 transition-all duration-200 cursor-pointer`}
                   onClick={() => {
                     setSelectedProject(project);
                     fetchProjectMembers(project.id);
                   }}>
                <h3 className={`text-xl font-semibold ${theme.text} mb-2`}>{project.name}</h3>
                <p className={`${theme.textSecondary} mb-4`}>{project.description}</p>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Progresso</span>
                    <span>{calculateProgress(project.tasks)}%</span>
                  </div>
                  <div className={`w-full ${theme.secondaryBg} rounded-full h-2`}>
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `${calculateProgress(project.tasks)}%`}}></div>
                  </div>
                </div>
                <div className={`text-sm ${theme.textSecondary}`}>
                  {project.tasks.length} tarefas
                </div>
              </div>
            ))}
            
            {['ENTERPRISE', 'ADM'].includes(user?.accountType || '') && (
              <div 
                onClick={() => setShowCreateModal(true)}
                className={`${theme.cardBg} border-2 border-dashed ${theme.border} hover:border-blue-500/50 rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center`}
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <FaPlus className="text-blue-400" />
                </div>
                <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>Novo Projeto</h3>
                <p className={`${theme.textSecondary} text-center`}>Clique para criar um novo projeto</p>
              </div>
            )}
          </div>
        )}

        {/* Modal Criar Projeto */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Criar Novo Projeto</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Nome</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Descrição</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
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

        {/* Modal Nova Tarefa */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Nova Tarefa</h3>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Título</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Descrição</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    rows={3}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Responsável</label>
                  <select
                    value={newTask.assignedToId}
                    onChange={(e) => setNewTask({...newTask, assignedToId: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                  >
                    <option value="">Selecionar responsável</option>
                    {projectMembers.map((member: any) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
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

        {/* Modal Editar Tarefa */}
        {showEditModal && editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Editar Tarefa</h3>
              <form onSubmit={handleUpdateTask} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Título</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({...editingTask, title: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Descrição</label>
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    rows={3}
                    placeholder="Descrição da tarefa..."
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Responsável</label>
                  <select
                    value={editingTask.assignedToId || ''}
                    onChange={(e) => setEditingTask({...editingTask, assignedToId: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                  >
                    <option value="">Selecionar responsável</option>
                    {projectMembers.map((member: any) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Status</label>
                  <select
                    value={editingTask.status || 'PENDING'}
                    onChange={(e) => setEditingTask({...editingTask, status: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="IN_PROGRESS">Em Progresso</option>
                    <option value="COMPLETED">Concluída</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
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

        {/* Modal Comentários */}
        {showCommentsModal && selectedTaskForComments && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
              {/* Cabeçalho da Tarefa */}
              <div className={`p-6 border-b ${theme.border}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className={`text-xl font-bold ${theme.text} mb-2`}>{selectedTaskForComments.title}</h2>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTaskForComments.status)}`}>
                        {selectedTaskForComments.status === 'PENDING' ? 'Pendente' : selectedTaskForComments.status === 'IN_PROGRESS' ? 'Em Progresso' : 'Concluída'}
                      </span>
                      <span className={theme.textSecondary}>👤 {selectedTaskForComments.assignedTo?.name || 'Não atribuído'}</span>
                      <span className={theme.textSecondary}>📅 {new Date(selectedTaskForComments.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCommentsModal(false)}
                    className={`${theme.textSecondary} hover:${theme.text} p-2 rounded-lg hover:bg-gray-500/20`}
                  >
                    ✕
                  </button>
                </div>
                {selectedTaskForComments.description && (
                  <div className={`${theme.secondaryBg} p-3 rounded-lg`}>
                    <h4 className={`font-medium ${theme.text} mb-2`}>Descrição:</h4>
                    <p className={`${theme.textSecondary} text-sm`}>{selectedTaskForComments.description}</p>
                  </div>
                )}
              </div>
              
              {/* Seção de Status (apenas para ENTERPRISE e ADM) */}
              {['ENTERPRISE', 'ADM'].includes(user?.accountType || '') && (
                <div className={`px-6 py-4 border-b ${theme.border}`}>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-2`}>Alterar Status:</label>
                  <select
                    value={selectedTaskForComments.status}
                    onChange={(e) => {
                      handleStatusChange(selectedTaskForComments.id, e.target.value);
                      setSelectedTaskForComments({...selectedTaskForComments, status: e.target.value});
                    }}
                    className={`px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="IN_PROGRESS">Em Progresso</option>
                    <option value="COMPLETED">Concluída</option>
                  </select>
                </div>
              )}
              
              {/* Comentários */}
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className={`font-semibold ${theme.text} mb-4 flex items-center`}>
                  💬 Comentários ({comments.length})
                </h3>
                <div className="space-y-4 mb-6">
                  {loadingComments ? (
                    <div className={`text-center ${theme.textSecondary} py-8`}>Carregando comentários...</div>
                  ) : comments.length === 0 ? (
                    <div className={`text-center ${theme.textSecondary} py-8`}>
                      <div className="text-4xl mb-2">💬</div>
                      <p>Nenhum comentário ainda</p>
                      <p className="text-xs">Seja o primeiro a comentar!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className={`${theme.secondaryBg} p-4 rounded-lg`}>
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-400 font-semibold text-sm">
                              {comment.author.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`font-medium ${theme.text} text-sm`}>{comment.author.name}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${comment.author.accountType === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' : comment.author.accountType === 'ADM' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                {comment.author.accountType === 'ENTERPRISE' ? 'Enterprise' : comment.author.accountType === 'ADM' ? 'Admin' : 'Usuário'}
                              </span>
                              <span className={`text-xs ${theme.textSecondary}`}>
                                {new Date(comment.createdAt).toLocaleDateString('pt-BR')} às {new Date(comment.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`${theme.text} text-sm leading-relaxed`}>{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Formulário de Comentário */}
              <div className={`p-6 border-t ${theme.border}`}>
                <form onSubmit={handleAddComment} className="flex space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicionar um comentário..."
                      className={`flex-1 px-4 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Projeto */}
        {showEditProjectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto`}>
              <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>Editar Projeto</h3>
              <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Nome</label>
                  <input
                    type="text"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject({...editingProject, name: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Descrição</label>
                  <textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    rows={3}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Membros do Projeto</label>
                  <div className={`${theme.secondaryBg} border ${theme.border} rounded-lg p-3 max-h-40 overflow-y-auto`}>
                    {members.filter((member: any) => 
                      member.id !== selectedProject?.ownerId && 
                      member.accountType !== 'ENTERPRISE'
                    ).map((member: any) => (
                      <label key={member.id} className="flex items-center space-x-2 py-1">
                        <input
                          type="checkbox"
                          checked={editingProject.memberIds.includes(member.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingProject({
                                ...editingProject,
                                memberIds: [...editingProject.memberIds, member.id]
                              });
                            } else {
                              setEditingProject({
                                ...editingProject,
                                memberIds: editingProject.memberIds.filter(id => id !== member.id)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className={`text-sm ${theme.text}`}>{member.name}</span>
                        <span className={`text-xs ${theme.textSecondary}`}>({member.accountType})</span>
                      </label>
                    ))}
                  </div>
                  <p className={`text-xs ${theme.textSecondary} mt-1`}>
                    Selecione os membros que terão acesso a este projeto
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditProjectModal(false)}
                    className={`px-4 py-2 ${theme.textSecondary} hover:${theme.text} transition-colors`}
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
      </AppLayout>
    </div>
  );
}