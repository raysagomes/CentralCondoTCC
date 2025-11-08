'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AppLayout from '../../src/components/Layout/AppLayout';
import { useTheme } from '../../src/contexts/ThemeContext';
import { getThemeClasses } from '../../src/utils/themeClasses';
import { FaPlus, FaEdit, FaTrash, FaUser, FaCalendarAlt, FaUserTie, FaComments, FaTimes, FaClock, FaBolt, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useProjects } from '../../src/hooks/useProjects';

export default function Projects() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();
  const { projects, loading: projectsLoading, createProject, updateProject, createTask, updateTask, deleteTask } = useProjects();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedToId: '', deadline: '' });
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState<string | null>(null);
  const [members, setMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState({ name: '', description: '', memberIds: [] });
  const [taskFilter, setTaskFilter] = useState('all');
  const [taskSearch, setTaskSearch] = useState('');

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
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
    if ((!newComment.trim() && selectedFiles.length === 0) || !selectedTaskForComments || isAddingComment) return;

    setIsAddingComment(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('content', newComment.trim());
      
      selectedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const response = await fetch(`/api/tasks/${selectedTaskForComments.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (response.ok) {
        setNewComment('');
        setSelectedFiles([]);
        fetchComments(selectedTaskForComments.id);
      }
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingComment(comment);
    setEditCommentText(comment.content);
  };

  const handleUpdateComment = async () => {
    if (!editingComment || !editCommentText.trim() || isUpdatingComment) return;

    setIsUpdatingComment(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${selectedTaskForComments.id}/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editCommentText.trim() })
      });
      
      if (response.ok) {
        setEditingComment(null);
        setEditCommentText('');
        fetchComments(selectedTaskForComments.id);
      }
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?') || isDeletingComment) return;

    setIsDeletingComment(commentId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${selectedTaskForComments.id}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchComments(selectedTaskForComments.id);
      }
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
    } finally {
      setIsDeletingComment(null);
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

  // Reset da página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [taskFilter, taskSearch]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    } else if (isAuthenticated && projects.length > 0) {
      // Verificar se há parâmetros na URL para navegar automaticamente
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId');
      const taskId = urlParams.get('taskId');
      
      if (projectId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
          // Se há taskId, abrir modal de comentários da tarefa
          if (taskId) {
            const task = project.tasks?.find(t => t.id === taskId);
            if (task) {
              setSelectedTaskForComments(task);
              setShowCommentsModal(true);
              fetchComments(task.id);
            }
          }
          // Limpar parâmetros da URL
          window.history.replaceState({}, '', '/projects');
        }
      }
    }
  }, [isAuthenticated, authLoading, router, projects]);

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
    if (isCreatingProject) return;
    
    setIsCreatingProject(true);
    try {
      const result = await createProject(newProject.name, newProject.description);
      if (result.success) {
        setShowCreateModal(false);
        setNewProject({ name: '', description: '' });
      }
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || isCreatingTask) return;
    
    setIsCreatingTask(true);
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        assignedToId: newTask.assignedToId || undefined,
        deadline: newTask.deadline ? new Date(newTask.deadline).toISOString() : undefined
      };
      const result = await createTask(selectedProject.id, taskData.title, taskData.description, taskData.assignedToId, taskData.deadline);
      if (result.success) {
        setShowTaskModal(false);
        setNewTask({ title: '', description: '', assignedToId: '', deadline: '' });
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          setSelectedProject({...updatedProject});
        }
      }
    } finally {
      setIsCreatingTask(false);
    }
  };


  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus });
    const updatedProject = projects.find(p => p.id === selectedProject.id);
    if (updatedProject) {
      setSelectedProject({...updatedProject});
    }
  };

  const handleEditTask = async (task: any) => {
    setEditingTask({ 
      ...task, 
      description: task.description || '',
      assignedToId: task.assignedTo?.id || '',
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : ''
    });
    // Garantir que os membros do projeto estejam carregados
    if (selectedProject) {
      await fetchProjectMembers(selectedProject.id);
    }
    setShowEditModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      const result = await updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description || '',
        assignedToId: editingTask.assignedToId || null,
        status: editingTask.status,
        deadline: editingTask.deadline ? new Date(editingTask.deadline).toISOString() : null
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
    if (!selectedProject || isUpdatingProject) return;

    setIsUpdatingProject(true);
    try {
      const result = await updateProject(selectedProject.id, editingProject);
      if (result.success) {
        setShowEditProjectModal(false);
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) {
          setSelectedProject({...updatedProject});
        }
      }
    } finally {
      setIsUpdatingProject(false);
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
    if (!tasks || tasks.length === 0) return 0;
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
                  {selectedProject.tasks?.length > itemsPerPage && (
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
                          console.log('selectedProject.members:', selectedProject.members);
                          const memberIds = selectedProject.members?.map((m: any) => m.userId || m.id) || [];
                          console.log('memberIds:', memberIds);
                          setEditingProject({
                            name: selectedProject.name,
                            description: selectedProject.description || '',
                            memberIds: memberIds
                          });
                          setShowEditProjectModal(true);
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Editar Projeto
                      </button>
                      <button 
                        onClick={() => setShowTaskModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Nova Tarefa
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Barra de progresso do projeto */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${theme.text}`}>Progresso do Projeto</span>
                  <span className={`text-sm font-bold ${
                    calculateProgress(selectedProject.tasks) === 100 ? 'text-green-400' : 'text-purple-400'
                  }`}>
                    {calculateProgress(selectedProject.tasks)}%
                  </span>
                </div>
                <div className={`w-full ${theme.secondaryBg} rounded-full h-4 mb-3`}>
                  <div 
                    className={`h-4 rounded-full transition-all duration-700 ${
                      calculateProgress(selectedProject.tasks) === 100 ? 'bg-green-500' : 'bg-purple-500'
                    }`} 
                    style={{width: `${calculateProgress(selectedProject.tasks)}%`}}
                  ></div>
                </div>
                
                {/* Estatísticas rápidas */}
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className={`p-3 ${theme.secondaryBg} rounded-lg`}>
                    <div className="text-lg font-bold text-yellow-400">
                      {selectedProject.tasks?.filter((t: any) => t.status === 'PENDING').length || 0}
                    </div>
                    <div className={`text-xs ${theme.textSecondary}`}>Pendentes</div>
                  </div>
                  <div className={`p-3 ${theme.secondaryBg} rounded-lg`}>
                    <div className="text-lg font-bold text-blue-400">
                      {selectedProject.tasks?.filter((t: any) => t.status === 'IN_PROGRESS').length || 0}
                    </div>
                    <div className={`text-xs ${theme.textSecondary}`}>Em Progresso</div>
                  </div>
                  <div className={`p-3 ${theme.secondaryBg} rounded-lg`}>
                    <div className="text-lg font-bold text-green-400">
                      {selectedProject.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0}
                    </div>
                    <div className={`text-xs ${theme.textSecondary}`}>Concluídas</div>
                  </div>
                  <div className={`p-3 ${theme.secondaryBg} rounded-lg`}>
                    <div className="text-lg font-bold text-purple-400">
                      {selectedProject.tasks?.length || 0}
                    </div>
                    <div className={`text-xs ${theme.textSecondary}`}>Total</div>
                  </div>
                </div>
              </div>

              {/* Filtros e busca */}
              <div className="mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <label className={`text-sm font-medium ${theme.textSecondary}`}>Filtrar:</label>
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className={`px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text} text-sm`}
                  >
                    <option value="all">Todas as tarefas</option>
                    <option value="PENDING">Pendentes</option>
                    <option value="IN_PROGRESS">Em Progresso</option>
                    <option value="COMPLETED">Concluídas</option>
                    <option value="overdue">Atrasadas</option>
                    <option value="due_soon">Urgentes</option>
                    <option value="my_tasks">Minhas Tarefas</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className={`text-sm font-medium ${theme.textSecondary}`}>Buscar:</label>
                  <input
                    type="text"
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Digite o nome da tarefa..."
                    className={`px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text} text-sm`}
                  />
                </div>
                
                {(taskFilter !== 'all' || taskSearch) && (
                  <button
                    onClick={() => {
                      setTaskFilter('all');
                      setTaskSearch('');
                    }}
                    className="text-sm text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedProject.tasks || [])
                  .filter(task => {
                    // Filtro por status
                    if (taskFilter === 'all') return true;
                    if (taskFilter === 'overdue') {
                      return task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';
                    }
                    if (taskFilter === 'due_soon') {
                      return task.deadline && new Date(task.deadline) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && task.status !== 'COMPLETED';
                    }
                    if (taskFilter === 'my_tasks') {
                      return task.assignedTo?.id === user?.id;
                    }
                    return task.status === taskFilter;
                  })
                  .filter(task => {
                    // Filtro por busca
                    if (!taskSearch) return true;
                    return task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
                           task.description?.toLowerCase().includes(taskSearch.toLowerCase()) ||
                           task.assignedTo?.name.toLowerCase().includes(taskSearch.toLowerCase());
                  })
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((task: any) => {
                    const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';
                    const isDueSoon = task.deadline && new Date(task.deadline) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && task.status !== 'COMPLETED';
                    
                    return (
                      <div key={task.id} className={`${theme.secondaryBg} border rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer ${
                        isOverdue ? 'border-red-500/50 bg-red-500/5' : 
                        isDueSoon ? 'border-yellow-500/50 bg-yellow-500/5' : 
                        theme.border
                      } hover:border-blue-500/50`}
                           onClick={() => handleShowComments(task)}>
                        
                        {/* Cabeçalho da tarefa */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)} flex items-center`}>
                              {task.status === 'PENDING' ? <><FaClock className="mr-1" /> Pendente</> : 
                               task.status === 'IN_PROGRESS' ? <><FaBolt className="mr-1" /> Em Progresso</> : 
                               <><FaCheck className="mr-1" /> Concluída</>}
                            </span>
                            {isOverdue && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 flex items-center">
                                <FaExclamationTriangle className="mr-1" /> Atrasada
                              </span>
                            )}
                            {isDueSoon && !isOverdue && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 flex items-center">
                                <FaClock className="mr-1" /> Urgente
                              </span>
                            )}
                          </div>
                          
                          {((['ENTERPRISE', 'ADM'].includes(user?.accountType || '')) || 
                            (selectedProject?.members?.some((m: any) => m.userId === user?.id))) && (
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                                className="text-blue-400 hover:text-blue-300 text-xs p-1 rounded hover:bg-blue-500/20 transition-all duration-200"
                                title="Editar tarefa"
                              >
                                <FaEdit />
                              </button>
                              {['ENTERPRISE', 'ADM'].includes(user?.accountType || '') && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                                  className="text-red-400 hover:text-red-300 text-xs p-1 rounded hover:bg-red-500/20 transition-all duration-200"
                                  title="Deletar tarefa"
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Título da tarefa */}
                        <h3 className={`font-semibold ${theme.text} mb-3 line-clamp-2 text-sm`}>{task.title}</h3>
                        
                        {/* Descrição (se houver) */}
                        {task.description && (
                          <p className={`text-xs ${theme.textSecondary} mb-3 line-clamp-2`}>
                            {task.description}
                          </p>
                        )}
                        
                        {/* Informações da tarefa */}
                        <div className={`text-xs ${theme.textSecondary} space-y-2`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FaUser className="mr-1" /> 
                              <span className={task.assignedTo ? theme.text : 'text-orange-400'}>
                                {task.assignedTo?.name || 'Não atribuído'}
                              </span>
                            </div>
                            {task.assignedTo && (
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                task.assignedTo.accountType === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' :
                                task.assignedTo.accountType === 'ADM' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {task.assignedTo.accountType === 'ENTERPRISE' ? 'Enterprise' :
                                 task.assignedTo.accountType === 'ADM' ? 'Admin' : 'User'}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1" /> 
                            Criada: {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                          
                          {task.deadline && (
                            <div className={`flex items-center ${
                              isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : theme.textSecondary
                            }`}>
                              <FaCalendarAlt className="mr-1" /> 
                              Prazo: {new Date(task.deadline).toLocaleDateString('pt-BR')}
                              {isOverdue && ' (Atrasada)'}
                              {isDueSoon && !isOverdue && ' (Urgente)'}
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <FaUserTie className="mr-1" /> 
                            Criada por: {task.createdBy?.name}
                          </div>
                        </div>
                        
                        {/* Botões de ação rápida */}
                        <div className="mt-3 pt-3 border-t border-gray-600/20">
                          <div className="flex justify-between items-center">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleShowComments(task); }}
                              className={`text-xs px-3 py-1 rounded-full ${theme.secondaryBg} ${theme.textSecondary} hover:${theme.text} transition-colors flex items-center`}
                            >
                              <FaComments className="mr-1" /> Ver Detalhes
                            </button>
                            
                            {task.status !== 'COMPLETED' && (task.assignedTo?.id === user?.id || ['ENTERPRISE', 'ADM'].includes(user?.accountType || '')) && (
                              <select
                                value={task.status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(task.id, e.target.value);
                                }}
                                className={`text-xs px-2 py-1 rounded ${theme.secondaryBg} border ${theme.border} ${theme.text}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="PENDING">Pendente</option>
                                <option value="IN_PROGRESS">Em Progresso</option>
                                <option value="COMPLETED">Concluir</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {(() => {
                const filteredTasks = (selectedProject.tasks || [])
                  .filter(task => {
                    if (taskFilter === 'all') return true;
                    if (taskFilter === 'overdue') {
                      return task.deadline && new Date(task.deadline) < new Date() && task.status !== 'COMPLETED';
                    }
                    if (taskFilter === 'due_soon') {
                      return task.deadline && new Date(task.deadline) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && task.status !== 'COMPLETED';
                    }
                    if (taskFilter === 'my_tasks') {
                      return task.assignedTo?.id === user?.id;
                    }
                    return task.status === taskFilter;
                  })
                  .filter(task => {
                    if (!taskSearch) return true;
                    return task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
                           task.description?.toLowerCase().includes(taskSearch.toLowerCase()) ||
                           task.assignedTo?.name.toLowerCase().includes(taskSearch.toLowerCase());
                  });
                
                const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
                
                return filteredTasks.length > itemsPerPage && (
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
                    
                    <span className={`text-sm ${theme.textSecondary}`}>
                      Página {currentPage} de {totalPages} ({filteredTasks.length} tarefas)
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? `${theme.textSecondary} cursor-not-allowed`
                          : `${theme.text} ${theme.secondaryBg} border ${theme.border} hover:${theme.hover}`
                      }`}
                    >
                      Próxima
                    </button>
                  </div>
                );
              })()}
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
                  <div className="flex justify-between text-sm mb-2">
                    <span className={theme.textSecondary}>Progresso</span>
                    <span className={`font-semibold ${calculateProgress(project.tasks) === 100 ? 'text-green-400' : 'text-purple-400'}`}>
                      {calculateProgress(project.tasks)}%
                    </span>
                  </div>
                  <div className={`w-full ${theme.secondaryBg} rounded-full h-3 mb-3`}>
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        calculateProgress(project.tasks) === 100 ? 'bg-green-500' : 'bg-purple-500'
                      }`} 
                      style={{width: `${calculateProgress(project.tasks)}%`}}
                    ></div>
                  </div>
                  
                  {/* Estatísticas das tarefas */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className={`text-center p-2 ${theme.secondaryBg} rounded`}>
                      <div className="font-semibold text-yellow-400">
                        {project.tasks?.filter(t => t.status === 'PENDING').length || 0}
                      </div>
                      <div className={theme.textSecondary}>Pendentes</div>
                    </div>
                    <div className={`text-center p-2 ${theme.secondaryBg} rounded`}>
                      <div className="font-semibold text-blue-400">
                        {project.tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0}
                      </div>
                      <div className={theme.textSecondary}>Em Progresso</div>
                    </div>
                    <div className={`text-center p-2 ${theme.secondaryBg} rounded`}>
                      <div className="font-semibold text-green-400">
                        {project.tasks?.filter(t => t.status === 'COMPLETED').length || 0}
                      </div>
                      <div className={theme.textSecondary}>Concluídas</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className={`text-sm ${theme.textSecondary}`}>
                    {project.tasks?.length || 0} tarefas total
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    calculateProgress(project.tasks) === 100 
                      ? 'bg-green-500/20 text-green-400' 
                      : calculateProgress(project.tasks) > 50 
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {calculateProgress(project.tasks) === 100 ? <><FaCheck className="inline mr-1" /> Completo</> : 
                     calculateProgress(project.tasks) > 50 ? <><FaBolt className="inline mr-1" /> Progredindo</> : <><FaClock className="inline mr-1" /> Iniciando</>}
                  </div>
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
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
                    disabled={isCreatingProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingProject ? 'Criando...' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Nova Tarefa */}
        {showTaskModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
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
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Prazo</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                  />
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
                    disabled={isCreatingTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingTask ? 'Criando...' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar Tarefa */}
        {showEditModal && editingTask && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
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
                    key={editingTask.id}
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
                    {members.map((member: any) => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-1`}>Prazo</label>
                  <input
                    type="date"
                    value={editingTask.deadline || ''}
                    onChange={(e) => setEditingTask({...editingTask, deadline: e.target.value})}
                    className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                  />
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                      <span className={`${theme.textSecondary} flex items-center`}><FaUser className="mr-1" /> {selectedTaskForComments.assignedTo?.name || 'Não atribuído'}</span>
                      <span className={`${theme.textSecondary} flex items-center`}><FaCalendarAlt className="mr-1" /> {new Date(selectedTaskForComments.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCommentsModal(false)}
                    className={`${theme.textSecondary} hover:${theme.text} p-2 rounded-lg hover:bg-gray-500/20`}
                  >
                    <FaTimes />
                  </button>
                </div>
                {selectedTaskForComments.description && (
                  <div className={`${theme.secondaryBg} p-3 rounded-lg mb-2`}>
                    <h4 className={`font-medium ${theme.text} mb-2`}>Descrição:</h4>
                    <p className={`${theme.textSecondary} text-sm`}>{selectedTaskForComments.description}</p>
                  </div>
                )}
                {selectedTaskForComments.deadline && (
                  <div className={`${theme.secondaryBg} p-3 rounded-lg`}>
                    <h4 className={`font-medium ${theme.text} mb-2`}>Prazo:</h4>
                    <p className={`${theme.textSecondary} text-sm text-orange-400`}>
                      {new Date(selectedTaskForComments.deadline).toLocaleDateString('pt-BR')} às {new Date(selectedTaskForComments.deadline).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Seção de Status (para membros do projeto) */}
              {((['ENTERPRISE', 'ADM'].includes(user?.accountType || '')) || 
                (selectedProject?.members?.some((m: any) => m.userId === user?.id))) && (
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
                  <FaComments className="mr-2" />Comentários ({comments.length})
                </h3>
                <div className="space-y-4 mb-6">
                  {loadingComments ? (
                    <div className={`text-center ${theme.textSecondary} py-8`}>Carregando comentários...</div>
                  ) : comments.length === 0 ? (
                    <div className={`text-center ${theme.textSecondary} py-8`}>
                      <div className="text-4xl mb-2"><FaComments /></div>
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
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className={`font-medium ${theme.text} text-sm`}>{comment.author.name}</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${comment.author.accountType === 'ENTERPRISE' ? 'bg-purple-500/20 text-purple-400' : comment.author.accountType === 'ADM' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                  {comment.author.accountType === 'ENTERPRISE' ? 'Enterprise' : comment.author.accountType === 'ADM' ? 'Admin' : 'Usuário'}
                                </span>
                                <span className={`text-xs ${theme.textSecondary}`}>
                                  {new Date(comment.createdAt).toLocaleDateString('pt-BR')} às {new Date(comment.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {comment.updatedAt && (
                                  <span className={`text-xs ${theme.textSecondary} italic`}>
                                    (editado)
                                  </span>
                                )}
                              </div>
                              {comment.author.id === user?.id && (
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleEditComment(comment)}
                                    className="text-blue-400 hover:text-blue-300 text-xs p-1 rounded hover:bg-blue-500/20 transition-all duration-200"
                                    title="Editar comentário"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    disabled={isDeletingComment === comment.id}
                                    className="text-red-400 hover:text-red-300 text-xs p-1 rounded hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50"
                                    title="Deletar comentário"
                                  >
                                    {isDeletingComment === comment.id ? '...' : <FaTrash />}
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingComment?.id === comment.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  className={`w-full px-3 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text} text-sm`}
                                  rows={3}
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={handleUpdateComment}
                                    disabled={isUpdatingComment || !editCommentText.trim()}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isUpdatingComment ? 'Salvando...' : 'Salvar'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingComment(null);
                                      setEditCommentText('');
                                    }}
                                    className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className={`${theme.text} text-sm leading-relaxed`}>{comment.content}</p>
                                {comment.attachments && comment.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {comment.attachments.map((attachment: string, index: number) => (
                                      <a
                                        key={index}
                                        href={attachment}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded mr-2 hover:bg-blue-500/30 transition-colors"
                                      >
                                        <FaPlus className="inline mr-1" /> Anexo {index + 1}
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Formulário de Comentário */}
              <div className={`p-6 border-t ${theme.border}`}>
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-400 font-semibold text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicionar um comentário..."
                        className={`w-full px-4 py-2 ${theme.secondaryBg} border ${theme.border} rounded-lg focus:outline-none focus:border-blue-500 ${theme.text}`}
                      />
                    </div>
                  </div>
                  
                  {/* Anexos */}
                  <div className="flex items-center space-x-3 ml-11">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`cursor-pointer text-sm ${theme.textSecondary} hover:${theme.text} transition-colors`}
                    >
                      {/* <FaPlus className="inline mr-1" /> Anexar arquivos */}
                    </label>
                    
                    <button
                      type="submit"
                      disabled={(!newComment.trim() && selectedFiles.length === 0) || isAddingComment}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingComment ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                  
                  {/* Lista de arquivos selecionados */}
                  {selectedFiles.length > 0 && (
                    <div className="ml-11 space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className={`flex items-center justify-between text-xs ${theme.textSecondary} bg-gray-500/10 px-2 py-1 rounded`}>
                          <span><FaPlus className="inline mr-1" /> {file.name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                            className="text-red-400 hover:text-red-300 ml-2"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar Projeto */}
        {showEditProjectModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
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
                
                {/* Seção de Membros */}
                <div>
                  <label className={`block text-sm font-medium ${theme.textSecondary} mb-2`}>Membros do Projeto</label>
                  <div className={`${theme.secondaryBg} border ${theme.border} rounded-lg p-3 max-h-40 overflow-y-auto`}>
                    {members.length === 0 ? (
                      <p className={`text-sm ${theme.textSecondary}`}>Carregando membros...</p>
                    ) : (
                      <div className="space-y-2">
                        {members.filter((member: any) => member.accountType !== 'ENTERPRISE').map((member: any) => (
                          <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
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
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={`text-sm ${theme.text}`}>{member.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              member.accountType === 'ADM' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {member.accountType === 'ADM' ? 'Admin' : 'User'}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className={`text-xs ${theme.textSecondary} mt-1`}>
                    {editingProject.memberIds.length} membro(s) selecionado(s)
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
                    disabled={isUpdatingProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingProject ? 'Salvando...' : 'Salvar'}
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