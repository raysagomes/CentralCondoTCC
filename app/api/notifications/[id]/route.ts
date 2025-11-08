import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { verifyToken } from '../../../../src/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const notification = await prisma.notification.update({
      where: {
        id: params.id,
        userId: decoded.userId
      },
      data: { status: 'READ' }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}