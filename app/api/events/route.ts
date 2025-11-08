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

    // Buscar eventos do usuário logado
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    let whereClause;
    if (user?.accountType === 'ENTERPRISE') {
      // ENTERPRISE vê todos os eventos da empresa
      whereClause = {
        OR: [
          { ownerId: decoded.userId },
          { enterpriseId: decoded.userId }
        ]
      };
    } else {
      // USER/ADM vê todos os eventos da empresa
      const enterpriseId = user?.enterpriseId;
      if (enterpriseId) {
        whereClause = { enterpriseId };
      } else {
        whereClause = { ownerId: decoded.userId };
      }
    }
    
    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
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

    // Buscar informações do usuário para determinar o enterpriseId correto
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Determinar o enterpriseId correto
    const enterpriseId = user.accountType === 'ENTERPRISE' ? user.id : user.enterpriseId;
    if (!enterpriseId) {
      return NextResponse.json({ error: 'Usuário não está associado a uma empresa' }, { status: 400 });
    }

    // Criar data usando UTC para evitar problemas de fuso horário
    const eventDate = new Date(date + 'T12:00:00.000Z');
    
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: eventDate,
        time,
        projectId: projectId || null,
        ownerId: decoded.userId,
        enterpriseId
      }
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}