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
        ownerId: decoded.userId
      },
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

    const { title, amount, dueDate, barcode, link } = await request.json();

    // Criar data com timezone de Fortaleza
    const paymentDueDate = new Date(dueDate + 'T23:59:59-03:00');
    
    const payment = await prisma.payment.create({
      data: {
        title,
        amount,
        dueDate: paymentDueDate,
        barcode,
        link,
        paid: false,
        ownerId: decoded.userId
      }
    });

    // Criar notificação imediatamente
    const now = new Date();
    const daysUntilDue = Math.ceil((paymentDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 14 && daysUntilDue >= 0) {
      await prisma.notification.create({
        data: {
          title: 'Pagamento Próximo do Vencimento',
          message: `O pagamento "${title}" vence em ${daysUntilDue} dia(s)`,
          type: 'PAYMENT',
          userId: decoded.userId,
          paymentId: payment.id
        }
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}