import { prisma } from '@/shared';

export interface ITaskRepository {
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  findPendingByOwnerId(ownerId: string): Promise<any[]>;
}

export class TaskRepository implements ITaskRepository {
  async create(data: any): Promise<any> {
    const task = await prisma.task.create({ data });
    return prisma.task.findUnique({
      where: { id: task.id },
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
        OR: [
          { project: { ownerId } },
          { assignedToId: ownerId }
        ],
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      },
      include: { project: true, assignedTo: true, createdBy: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
  }
}