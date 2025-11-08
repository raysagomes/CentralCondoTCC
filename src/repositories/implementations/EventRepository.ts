import { prisma } from '../../lib/prisma';
import { IEventRepository } from '../interfaces/IEventRepository';

export class EventRepository implements IEventRepository {
  async findByOwnerId(ownerId: string): Promise<any[]> {
    // Buscar o usuário para obter o enterpriseId
    const user = await prisma.user.findUnique({
      where: { id: ownerId }
    });
    
    if (!user) return [];
    
    // Determinar o enterpriseId
    const enterpriseId = user.accountType === 'ENTERPRISE' ? user.id : user.enterpriseId;
    
    if (!enterpriseId) return [];
    
    return prisma.event.findMany({
      where: { enterpriseId },
      include: { project: true },
      orderBy: { date: 'asc' }
    });
  }

  async create(data: any): Promise<any> {
    return prisma.event.create({ data });
  }

  async findRecentByOwnerId(ownerId: string): Promise<any[]> {
    // Buscar o usuário para obter o enterpriseId
    const user = await prisma.user.findUnique({
      where: { id: ownerId }
    });
    
    if (!user) return [];
    
    // Determinar o enterpriseId
    const enterpriseId = user.accountType === 'ENTERPRISE' ? user.id : user.enterpriseId;
    
    if (!enterpriseId) return [];
    
    return prisma.event.findMany({
      where: {
        enterpriseId,
        date: { gte: new Date() }
      },
      include: { project: true },
      orderBy: { date: 'asc' },
      take: 5
    });
  }
}