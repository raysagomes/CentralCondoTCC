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

    // Verificar e criar notificações de pagamentos pendentes
    await checkAndCreatePaymentNotifications(decoded.userId);

    const notifications = await prisma.notification.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função para verificar pagamentos e criar notificações
async function checkAndCreatePaymentNotifications(userId: string) {
  const pendingPayments = await prisma.payment.findMany({
    where: {
      ownerId: userId,
      paid: false,
      dueDate: {
        gte: new Date(),
        lte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    }
  });

  for (const payment of pendingPayments) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        paymentId: payment.id,
        userId: userId
      }
    });

    if (!existingNotification) {
      const now = new Date();
      const daysUntilDue = Math.ceil((payment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      await prisma.notification.create({
        data: {
          title: 'Pagamento Próximo do Vencimento',
          message: `O pagamento "${payment.title}" vence em ${daysUntilDue} dia(s)`,
          type: 'PAYMENT',
          userId: userId,
          paymentId: payment.id
        }
      });
    }
  }
}



export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { notificationId } = await request.json();

    await prisma.notification.update({
      where: { id: notificationId },
      data: { status: 'read' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}