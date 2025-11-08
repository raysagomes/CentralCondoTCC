import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/lib/auth';
import { prisma } from '../../../src/lib/prisma';

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

    // Buscar eventos dos projetos que o usuário tem acesso
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: decoded.userId },
          { members: { some: { userId: decoded.userId } } }
        ]
      },
      select: { id: true }
    });

    const projectIds = userProjects.map(p => p.id);

    const events = await prisma.event.findMany({
      where: {
        OR: [
          { projectId: { in: projectIds } },
          { projectId: null } // Eventos globais
        ]
      },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { title, description, date, time, projectId } = await request.json();

    // Criar data com timezone de Fortaleza
    const eventDate = new Date(date + 'T' + (time || '00:00') + ':00-03:00');
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
        time,
        projectId: projectId || null
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}