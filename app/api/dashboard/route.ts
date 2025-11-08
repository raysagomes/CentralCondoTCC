import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      prisma.event.findMany({
        where: { ownerId: decoded.userId },
        orderBy: { date: 'asc' },
        take: 5,
        include: { project: true }
      }),
      prisma.task.findMany({
        where: { 
          assignedToId: decoded.userId,
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { 
          project: { select: { id: true, name: true } },
          createdBy: { select: { name: true } }
        }
      }),
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