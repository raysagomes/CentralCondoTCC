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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    let whereClause = {};
    if (user.accountType === 'COMPANY') {
      // COMPANY vê eventos de todos os projetos que possui
      whereClause = {
        OR: [
          { project: { ownerId: decoded.userId } },
          { projectId: null } // Eventos gerais
        ]
      };
    } else {
      // USER vê eventos dos projetos em que participa
      whereClause = {
        OR: [
          { project: { members: { some: { userId: decoded.userId } } } },
          { projectId: null } // Eventos gerais
        ]
      };
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: { project: { select: { name: true } } },
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.accountType !== 'COMPANY') {
      return NextResponse.json({ error: 'Apenas COMPANY pode criar eventos' }, { status: 403 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
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