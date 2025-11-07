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

    const notification = await prisma.notification.create({
      data: {
        title: 'Notificação de Teste',
        message: 'Esta é uma notificação de teste para verificar o sistema.',
        type: 'GENERAL',
        userId: decoded.userId,
        seen: false
      }
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Erro ao criar notificação de teste:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}