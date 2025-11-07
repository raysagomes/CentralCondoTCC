import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/lib/auth';
import { EventService, EventRepository } from '@/modules/financeiro';
import { TaskService, TaskRepository, ProjectService, ProjectRepository } from '@/modules/projetos';
import { prisma } from '@/shared';

const eventRepository = new EventRepository();
const taskRepository = new TaskRepository();
const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);
const eventService = new EventService(eventRepository, projectService);
const taskService = new TaskService(taskRepository, projectService);

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const [recentEvents, pendingTasks, notifications] = await Promise.all([
      eventService.getRecentEventsByOwner(decoded.userId),
      taskService.getPendingTasksByOwner(decoded.userId),
      prisma.notification.findMany({
        where: { userId: decoded.userId, status: 'UNREAD' },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return NextResponse.json({
      recentEvents,
      pendingTasks,
      notifications
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}