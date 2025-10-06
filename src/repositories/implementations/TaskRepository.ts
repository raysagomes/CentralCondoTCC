import { prisma } from '../../lib/prisma';
import { ITaskRepository } from '../interfaces/ITaskRepository';

export class TaskRepository implements ITaskRepository {
  async create(data: any): Promise<any> {
    return prisma.task.create({
      data,
      include: {
        assignedTo: true,
        createdBy: true
      }
    });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.task.findUnique({
      where: { id },
      include: { project: true }
    });
  }

  async update(id: string, data: any): Promise<any> {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignedTo: true,
        createdBy: true
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }

  async findPendingByOwnerId(ownerId: string): Promise<any[]> {
    return prisma.task.findMany({
      where: {
        project: { ownerId },
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      },
      include: { project: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
  }
}