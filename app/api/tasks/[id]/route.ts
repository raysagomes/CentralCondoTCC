import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../src/lib/auth';
import { prisma } from '../../../../src/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const updates = await request.json();
    const taskId = params.id;

    // Buscar tarefa atual para verificar mudança de status
    const currentTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignedTo: true, project: true }
    });

    if (!currentTask) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...updates,
        finishedAt: updates.status === 'COMPLETED' ? new Date() : null
      },
      include: { assignedTo: true, project: true }
    });

    // Se a tarefa foi concluída, notificar administradores
    if (updates.status === 'COMPLETED' && currentTask.status !== 'COMPLETED') {
      const admins = await prisma.user.findMany({
        where: { accountType: 'COMPANY' }
      });

      const userName = updatedTask.assignedTo?.name || 'Usuário';
      const taskTitle = updatedTask.title;
      const projectName = updatedTask.project?.name || 'Projeto';

      // Criar notificações para todos os administradores
      await Promise.all(
        admins.map(admin => 
          prisma.notification.create({
            data: {
              title: 'Tarefa Concluída',
              message: `${userName} concluiu a tarefa "${taskTitle}" do projeto ${projectName}`,
              type: 'GENERAL',
              userId: admin.id,
              seen: false
            }
          })
        )
      );
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const taskId = params.id;

    await prisma.task.delete({
      where: { id: taskId }
    });

    return NextResponse.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}