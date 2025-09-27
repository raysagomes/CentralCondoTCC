import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/lib/auth';
import { EventService } from '../../../src/services/implementations/EventService';
import { EventRepository } from '../../../src/repositories/implementations/EventRepository';
import { TaskService } from '../../../src/services/implementations/TaskService';
import { TaskRepository } from '../../../src/repositories/implementations/TaskRepository';
import { ProjectService } from '../../../src/services/implementations/ProjectService';
import { ProjectRepository } from '../../../src/repositories/implementations/ProjectRepository';
import { prisma } from '../../../src/lib/prisma';

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
        where: { userId: decoded.userId, seen: false },
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