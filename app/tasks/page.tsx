'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../src/hooks/useAuth'

interface Task {
  id: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  deadline?: string
  createdAt: string
  project: {
    id: string
    name: string
  }
  createdBy: {
    name: string
  }
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-orange-100 text-orange-800',
  HIGH: 'bg-red-100 text-red-800',
  URGENT: 'bg-red-200 text-red-900'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    fetchMyTasks()
  }, [])

  const fetchMyTasks = async () => {
    try {
      const response = await fetch('/api/tasks/my-tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchMyTasks()
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const goToProject = (projectId: string, taskId: string) => {
    router.push(`/projects?projectId=${projectId}&taskId=${taskId}`)
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Tarefas</h1>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todas</option>
          <option value="PENDING">Pendentes</option>
          <option value="IN_PROGRESS">Em Progresso</option>
          <option value="COMPLETED">Concluídas</option>
        </select>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma tarefa encontrada</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => goToProject(task.project.id, task.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {task.description && (
                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  <span className="font-medium">Projeto:</span> {task.project.name}
                </div>
                <div>
                  <span className="font-medium">Criado por:</span> {task.createdBy.name}
                </div>
              </div>

              {task.deadline && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">Prazo:</span> {new Date(task.deadline).toLocaleDateString('pt-BR')}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                {task.status === 'PENDING' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateTaskStatus(task.id, 'IN_PROGRESS')
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Iniciar
                  </button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      updateTaskStatus(task.id, 'COMPLETED')
                    }}
                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                  >
                    Concluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}