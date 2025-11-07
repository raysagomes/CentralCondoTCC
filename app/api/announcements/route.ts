import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Determina o ID da empresa
    const enterpriseId = user.accountType === 'ENTERPRISE' ? user.id : user.enterpriseId;
    
    if (!enterpriseId) {
      return NextResponse.json({ announcements: [] });
    }

    const announcements = await prisma.announcement.findMany({
      where: { 
        OR: [
          { authorId: enterpriseId },
          { author: { enterpriseId: enterpriseId } }
        ]
      },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !['ENTERPRISE', 'ADM'].includes(user.accountType)) {
      return NextResponse.json({ error: 'Apenas ENTERPRISE e ADM podem criar avisos' }, { status: 403 });
    }

    const { title, content, priority } = await request.json();

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority,
        authorId: user.id
      },
      include: { author: { select: { name: true } } }
    });

    // Criar notificações para todos os usuários da empresa
    const enterpriseId = user.accountType === 'ENTERPRISE' ? user.id : user.enterpriseId;
    
    if (enterpriseId) {
      const usersToNotify = await prisma.user.findMany({
        where: {
          OR: [
            { id: enterpriseId },
            { enterpriseId: enterpriseId }
          ],
          id: { not: user.id } // Não notificar o próprio autor
        }
      });

      await Promise.all(
        usersToNotify.map((targetUser: any) => 
          prisma.notification.create({
            data: {
              title: `Novo aviso: ${title}`,
              message: `${user.name} publicou um novo aviso com prioridade ${priority === 'HIGH' ? 'Alta' : priority === 'MEDIUM' ? 'Média' : 'Normal'}`,
              type: 'GENERAL',
              status: 'UNREAD',
              userId: targetUser.id
            }
          })
        )
      );
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}