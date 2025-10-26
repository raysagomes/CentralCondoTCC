import { prisma } from '@/shared';

export interface IProjectRepository {
  findByOwnerId(ownerId: string): Promise<any[]>;
  findByUserAccess(userId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  addMembers(projectId: string, memberIds: string[]): Promise<any>;
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
    return prisma.project.findUnique({ 
      where: { id },
      include: {
        members: { include: { user: true } },
        owner: true
      }
    });
  }

  async findByUserAccess(userId: string): Promise<any[]> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (user?.accountType === 'ENTERPRISE') {
      // ENTERPRISE tem acesso a todos os projetos da empresa
      return prisma.project.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { owner: { enterpriseId: userId } }
          ]
        },
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
    
    return prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      },
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

  async update(id: string, data: any): Promise<any> {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        members: { include: { user: true } }
      }
    });
  }

  async addMembers(projectId: string, memberIds: string[]): Promise<any> {
    await prisma.projectMember.deleteMany({
      where: { projectId }
    });
    
    if (memberIds.length > 0) {
      await prisma.projectMember.createMany({
        data: memberIds.map(userId => ({ projectId, userId }))
      });
    }
    
    return this.findById(projectId);
  }
}