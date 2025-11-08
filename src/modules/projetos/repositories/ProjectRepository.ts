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
    console.log('=== BUSCANDO PROJETOS PARA USER:', userId, '===');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log('Tipo de usuário:', user?.accountType);
    
    if (user?.accountType === 'ENTERPRISE') {
      console.log('Buscando projetos como ENTERPRISE');
      // ENTERPRISE tem acesso a todos os projetos da empresa
      const projects = await prisma.project.findMany({
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
      console.log('Projetos encontrados (ENTERPRISE):', projects.length);
      return projects;
    }
    
    console.log('Buscando projetos como USER/ADM');
    const projects = await prisma.project.findMany({
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
    console.log('Projetos encontrados (USER/ADM):', projects.length);
    
    // Verificar tarefas em cada projeto
    for (const project of projects) {
      console.log(`Projeto ${project.name}: ${project.tasks?.length || 0} tarefas`);
      if (project.tasks?.length > 0) {
        project.tasks.forEach(task => {
          console.log(`  - Tarefa: ${task.title} (ID: ${task.id}, ProjectId: ${task.projectId})`);
        });
      }
    }
    
    // Verificar membros dos projetos
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      include: { project: true }
    });
    console.log('Memberships encontradas:', memberships.length);
    
    return projects;
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