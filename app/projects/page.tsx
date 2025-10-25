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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          setSelectedProject({...updatedProject});
        }
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
                {['ENTERPRISE', 'ADM'].includes(user?.accountType || '') && (
                  <button 
                    onClick={handleQuickCreateTask}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Nova Tarefa
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {selectedProject.tasks
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((task: any) => (
                  <div key={task.id} className={`${theme.secondaryBg} border ${theme.border} rounded-lg p-4 hover:border-blue-500/50 transition-all duration-200`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`font-semibold ${theme.text}`}>{task.title}</h3>
                        <div className={`flex items-center space-x-4 mt-2 text-sm ${theme.textSecondary}`}>
                          <span>Responsável: {task.assignedTo?.name || 'Não atribuído'}</span>
                          <span>Criado: {new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span>Por: {task.createdBy?.name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(task.status)} bg-transparent`}
                        >
                          <option value="PENDING">Pendente</option>
                          <option value="IN_PROGRESS">Em Progresso</option>
                          <option value="COMPLETED">Concluída</option>
                        </select>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleShowComments(task)}
                            className="text-green-400 hover:text-green-300 text-xs px-2 py-1 rounded hover:bg-green-500/20 transition-all duration-200"
                          >
                            Comentários
                          </button>
                          {['ENTERPRISE', 'ADM'].includes(user?.accountType || '') && (
                            <>
                              <button
                                onClick={() => handleEditTask(task)}
                                className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded hover:bg-blue-500/20 transition-all duration-200"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/20 transition-all duration-200"
                              >
                                Deletar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
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
                   onClick={() => setSelectedProject(project)}>
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
                    {members.map((member: any) => (
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
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                    rows={3}
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
                    {members.map((member: any) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${theme.cardBg} border ${theme.border} rounded-xl p-6 w-96 max-h-[80vh] overflow-hidden flex flex-col`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-semibold ${theme.text}`}>Comentários - {selectedTaskForComments.title}</h3>
                <button 
                  onClick={() => setShowCommentsModal(false)}
                  className={`${theme.textSecondary} hover:${theme.text}`}
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {loadingComments ? (
                  <div className={`text-center ${theme.textSecondary}`}>Carregando comentários...</div>
                ) : comments.length === 0 ? (
                  <div className={`text-center ${theme.textSecondary}`}>Nenhum comentário ainda</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className={`${theme.secondaryBg} p-3 rounded-lg`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-medium ${theme.text} text-sm`}>{comment.author.name}</span>
                        <span className={`text-xs ${theme.textSecondary}`}>
                          {new Date(comment.createdAt).toLocaleDateString('pt-BR')} {new Date(comment.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`${theme.text} text-sm`}>{comment.content}</p>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={handleAddComment} className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicionar comentário..."
                  className={`flex-1 px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text} text-sm`}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}
        </div>
      </AppLayout>
    </div>
  );
}