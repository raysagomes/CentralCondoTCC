import { prisma } from '@/shared';

export interface IProjectRepository {
  findByOwnerId(ownerId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
}

export class ProjectRepository implements IProjectRepository {
  async findByOwnerId(ownerId: string): Promise<any[]> {
    return prisma.project.findMany({
      where: { ownerId },
      include: {
        tasks: {
          include: {
            assignedTo: true,
            createdBy: true
          }
        },
        members: {
          include: { user: true }
        }
      }
    });
  }

  async create(data: any): Promise<any> {
    return prisma.project.create({ data });
  }

  async findById(id: string): Promise<any | null> {
    return prisma.project.findUnique({ where: { id } });
  }
}