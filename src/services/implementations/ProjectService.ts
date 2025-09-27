import { IProjectRepository } from '../../repositories/interfaces/IProjectRepository';

export class ProjectService {
  constructor(private projectRepository: IProjectRepository) {}

  async getProjectsByOwner(ownerId: string) {
    return this.projectRepository.findByOwnerId(ownerId);
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
}