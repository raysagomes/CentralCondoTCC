import { prisma } from '../../lib/prisma';
import { IEventRepository } from '../interfaces/IEventRepository';

export class EventRepository implements IEventRepository {
  async findByOwnerId(ownerId: string): Promise<any[]> {
    return prisma.event.findMany({
      where: {
        OR: [
          { project: { ownerId } },
          { projectId: null }
        ]
      },
      include: { project: true },
      orderBy: { date: 'asc' }
    });
  }

  async create(data: any): Promise<any> {
    return prisma.event.create({ data });
  }

  async findRecentByOwnerId(ownerId: string): Promise<any[]> {
    return prisma.event.findMany({
      where: {
        OR: [
          { project: { ownerId } },
          { projectId: null }
        ],
        date: { gte: new Date() }
      },
      include: { project: true },
      orderBy: { date: 'asc' },
      take: 5
    });
  }
}