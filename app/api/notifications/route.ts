import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { verifyToken } from '../../../src/lib/auth';

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

    const sender = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (sender?.accountType !== 'COMPANY') {
      return NextResponse.json({ error: 'Apenas empresas podem enviar notificações' }, { status: 403 });
    }

    const { title, message, type, recipients, selectedMembers } = await request.json();

    let users;
    if (recipients === 'specific' && selectedMembers?.length > 0) {
      users = await prisma.user.findMany({
        where: { 
          id: { in: selectedMembers },
          accountType: 'USER' 
        }
      });
    } else {
      users = await prisma.user.findMany({
        where: { accountType: 'USER' }
      });
    }

    const notifications = await Promise.all(
      users.map(user => 
        prisma.notification.create({
          data: {
            title,
            message,
            type: type || 'GENERAL',
            userId: user.id,
            seen: false
          }
        })
      )
    );

    return NextResponse.json({ success: true, count: notifications.length });
  } catch (error) {
    console.error('Erro ao enviar notificações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}