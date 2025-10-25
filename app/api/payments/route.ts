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

    const { title, amount, dueDate } = await request.json();

    let project = await prisma.project.findFirst({
      where: { ownerId: decoded.userId }
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: 'Projeto Padrão',
          description: 'Projeto criado automaticamente',
          ownerId: decoded.userId
        }
      });
    }

    const payment = await prisma.payment.create({
      data: {
        title,
        dueDate: new Date(dueDate),
        paid: false,
        link: amount.toString()
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}