import { IEventRepository } from '../../repositories/interfaces/IEventRepository';
import { ProjectService } from './ProjectService';

export class EventService {
  constructor(
    private eventRepository: IEventRepository,
    private projectService: ProjectService
  ) {}

  async getEventsByOwner(ownerId: string) {
    return this.eventRepository.findByOwnerId(ownerId);
  }

  async createEvent(title: string, description: string, date: string, time: string, projectId: string | null, ownerId: string) {
    if (!title || !date) {
      throw new Error('Título e data são obrigatórios');
    }

    if (projectId) {
      await this.projectService.validateProjectOwnership(projectId, ownerId);
    }

    return this.eventRepository.create({
      title,
      description,
      date: new Date(date + (time ? `T${time}` : 'T00:00')),
      time,
      projectId
    });
  }

  async getRecentEventsByOwner(ownerId: string) {
    return this.eventRepository.findRecentByOwnerId(ownerId);
  }
}