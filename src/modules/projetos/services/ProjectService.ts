import { IProjectRepository } from '@/modules/projetos/repositories/IProjectRepository';

export class ProjectService {
  constructor(private projectRepository: IProjectRepository) {}

  async getProjectsByOwner(ownerId: string) {
    return this.projectRepository.findByOwnerId(ownerId);
  }

  async getAllUserProjects(userId: string) {
    return this.projectRepository.findByUserAccess(userId);
  }



  async createProject(name: string, description: string, ownerId: string) {
    if (!name) {
      throw new Error('Nome é obrigatório');
    }

    return this.projectRepository.create({
      name,
      description,
      ownerId
    });
  }

  async validateProjectOwnership(projectId: string, ownerId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project || project.ownerId !== ownerId) {
      throw new Error('Projeto não encontrado');
    }
    return project;
  }

  async validateProjectAccess(projectId: string, userId: string) {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Projeto não encontrado');
    }
    
    // Buscar dados do usuário para verificar se é ENTERPRISE
    const { prisma } = require('@/shared');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const isOwner = project.ownerId === userId;
    const isMember = project.members?.some((member: any) => member.userId === userId);
    const isEnterprise = user?.accountType === 'ENTERPRISE' && 
      (project.ownerId === userId || project.owner?.enterpriseId === userId);
    
    if (!isOwner && !isMember && !isEnterprise) {
      throw new Error('Acesso negado ao projeto');
    }
    
    return project;
  }

  async updateProject(projectId: string, data: any, ownerId: string) {
    await this.validateProjectOwnership(projectId, ownerId);
    return this.projectRepository.update(projectId, data);
  }

  async addMembersToProject(projectId: string, memberIds: string[], ownerId: string) {
    await this.validateProjectOwnership(projectId, ownerId);
    return this.projectRepository.addMembers(projectId, memberIds);
  }
}