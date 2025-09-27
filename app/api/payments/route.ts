import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { verifyToken } from '../../../src/lib/auth';

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

    const payments = await prisma.payment.findMany({
      where: {
        project: { ownerId: decoded.userId }
      },
      include: { project: true },
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}