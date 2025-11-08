import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { verifyToken } from '../../../src/lib/auth';

export async function GET(request: NextRequest) {
  console.log('=== API NOTIFICATIONS GET ===');
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token presente:', !!token);
    
    if (!token) {
      console.log('Erro: Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Token válido:', !!decoded);
    
    if (!decoded) {
      console.log('Erro: Token inválido');
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar e criar todas as notificações
    await checkAllNotifications(decoded.userId);

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

async function checkAllNotifications(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) return;
  
  const enterpriseId = user.accountType === 'ENTERPRISE' ? user.id : user.enterpriseId;
  if (!enterpriseId) return;
  
  const settings = getNotificationSettings();
  
  await Promise.all([
    checkPaymentNotifications(userId, enterpriseId, settings),
    checkEventNotifications(userId, enterpriseId, settings),
    checkTaskNotifications(userId, settings)
  ]);
}

function getNotificationSettings() {
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
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
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
          gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
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

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const futureDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Buscar tarefas atribuídas ao usuário
  const assignedTasks = await prisma.task.findMany({
    where: {
      assignedToId: userId,
      status: {
        in: ['PENDING', 'IN_PROGRESS']
      },
      deadline: {
        gte: today,
        lte: futureDate
      }
    }
  });

  for (const task of assignedTasks) {
    if (!task.deadline) continue;

    const taskDate = new Date(task.deadline.getFullYear(), task.deadline.getMonth(), task.deadline.getDate());
    const daysUntilDue = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Verificar se já existe notificação para esta tarefa hoje
    const existingNotification = await prisma.notification.findFirst({
      where: {
        taskId: task.id,
        userId: userId,
        createdAt: {
          gte: today
        }
      }
    });

    if (!existingNotification) {
      let title, message;
      
      if (daysUntilDue === 0) {
        // Tarefa vence hoje
        title = 'Tarefa Vence Hoje';
        message = `A tarefa "${task.title}" vence hoje!`;
      } else if (daysUntilDue <= 7) {
        // Tarefa vence em alguns dias
        title = 'Tarefa Próxima do Prazo';
        message = `A tarefa "${task.title}" vence em ${daysUntilDue} dia(s)`;
      }
      
      if (title && message) {
        await prisma.notification.create({
          data: {
            title,
            message,
            type: 'ALERT',
            userId: userId,
            taskId: task.id
          }
        });
      }
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
      data: { status: 'READ' }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}