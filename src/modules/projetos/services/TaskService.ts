import { ITaskRepository } from '@/modules/projetos/repositories/ITaskRepository';
import { ProjectService } from './ProjectService';

export class TaskService {
  constructor(
    private taskRepository: ITaskRepository,
    private projectService: ProjectService
  ) {}

  async createTask(title: string, description: string, projectId: string, assignedToId: string, createdById: string, deadline?: string) {
    if (!title || !projectId) {
      throw new Error('Título e projeto são obrigatórios');
    }

    await this.projectService.validateProjectAccess(projectId, createdById);

    return this.taskRepository.create({
      title,
      description,
      projectId,
      assignedToId,
      createdById,
      deadline: deadline ? new Date(deadline) : undefined
    });
  }

  async updateTask(taskId: string, updates: any, ownerId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.project.ownerId !== ownerId) {
      throw new Error('Tarefa não encontrada');
    }

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      updateData.finishedAt = updates.status === 'COMPLETED' ? new Date() : null;
    }
    if (updates.assignedToId !== undefined) updateData.assignedToId = updates.assignedToId;
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline ? new Date(updates.deadline) : null;

    return this.taskRepository.update(taskId, updateData);
  }

  async deleteTask(taskId: string, ownerId: string) {
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.project.ownerId !== ownerId) {
      throw new Error('Tarefa não encontrada');
    }

    await this.taskRepository.delete(taskId);
  }

  async getPendingTasksByOwner(ownerId: string) {
    return this.taskRepository.findPendingByOwnerId(ownerId);
  }
}