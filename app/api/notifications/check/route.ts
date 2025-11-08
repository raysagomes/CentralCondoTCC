import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    await checkAndCreateAllNotifications();
    return NextResponse.json({ success: true, message: 'Notificações verificadas e criadas' });
  } catch (error) {
    console.error('Erro ao verificar notificações:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

async function checkAndCreateAllNotifications() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { accountType: 'ENTERPRISE' },
        { enterpriseId: { not: null } }
      ]
    }
  });

  for (const user of users) {
    const enterpriseId = user.accountType === 'ENTERPRISE' ? user.id : user.enterpriseId;
    if (!enterpriseId) continue;

    // Buscar configurações do usuário (padrão: 7 dias)
    const settings = await getNotificationSettings(user.id);
    
    await Promise.all([
      checkPaymentNotifications(user.id, enterpriseId, settings),
      checkEventNotifications(user.id, enterpriseId, settings),
      checkTaskNotifications(user.id, settings)
    ]);
  }
}

async function getNotificationSettings(userId: string) {
  // Configurações padrão (7 dias)
  return {
    paymentNotifications: true,
    paymentDays14: false,
    paymentDays7: true,
    eventNotifications: true,
    eventDays14: false,
    eventDays7: true,
    taskNotifications: true,
    taskDays14: false,
    taskDays7: true
  };
}

async function checkPaymentNotifications(userId: string, enterpriseId: string, settings: any) {
  if (!settings.paymentNotifications) return;

  const days = settings.paymentDays14 ? 14 : 7;
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const pendingPayments = await prisma.payment.findMany({
    where: {
      ownerId: enterpriseId,
      paid: false,
      dueDate: {
        gte: now,
        lte: futureDate
      }
    }
  });

  for (const payment of pendingPayments) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        paymentId: payment.id,
        userId: userId,
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Últimas 24h
        }
      }
    });

    if (!existingNotification) {
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

async function checkEventNotifications(userId: string, enterpriseId: string, settings: any) {
  if (!settings.eventNotifications) return;

  const days = settings.eventDays14 ? 14 : 7;
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const upcomingEvents = await prisma.event.findMany({
    where: {
      enterpriseId: enterpriseId,
      date: {
        gte: now,
        lte: futureDate
      }
    }
  });

  for (const event of upcomingEvents) {
    const existingNotification = await prisma.notification.findFirst({
      where: {
        eventId: event.id,
        userId: userId,
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Últimas 24h
        }
      }
    });

    if (!existingNotification) {
      const daysUntilEvent = Math.ceil((event.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      await prisma.notification.create({
        data: {
          title: 'Evento Próximo',
          message: `O evento "${event.title}" acontece em ${daysUntilEvent} dia(s)`,
          type: 'EVENT',
          userId: userId,
          eventId: event.id
        }
      });
    }
  }
}

async function checkTaskNotifications(userId: string, settings: any) {
  if (!settings.taskNotifications) return;

  const days = settings.taskDays14 ? 14 : 7;
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // Buscar apenas tarefas atribuídas ao usuário
  const assignedTasks = await prisma.task.findMany({
    where: {
      assignedToId: userId,
      status: {
        in: ['PENDING', 'IN_PROGRESS']
      },
      finishedAt: {
        gte: now,
        lte: futureDate
      }
    }
  });

  for (const task of assignedTasks) {
    if (!task.finishedAt) continue;

    const existingNotification = await prisma.notification.findFirst({
      where: {
        type: 'ALERT',
        title: 'Tarefa Próxima do Prazo',
        message: { contains: task.title },
        userId: userId,
        createdAt: {
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Últimas 24h
        }
      }
    });

    if (!existingNotification) {
      const daysUntilDue = Math.ceil((task.finishedAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 1000));
      
      await prisma.notification.create({
        data: {
          title: 'Tarefa Próxima do Prazo',
          message: `A tarefa "${task.title}" vence em ${daysUntilDue} dia(s)`,
          type: 'ALERT',
          userId: userId
        }
      });
    }
  }
}