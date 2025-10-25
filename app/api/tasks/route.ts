import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/lib/auth';
import { TaskService, TaskRepository, ProjectService, ProjectRepository } from '@/modules/projetos';

const taskRepository = new TaskRepository();
const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);
const taskService = new TaskService(taskRepository, projectService);

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

    // Verificar permissões do usuário
    const { prisma } = require('../../../src/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !['ENTERPRISE', 'ADM'].includes(user.accountType)) {
      return NextResponse.json({ error: 'Apenas ENTERPRISE e ADM podem criar tarefas' }, { status: 403 });
    }

    const { title, description, projectId, assignedToId } = await request.json();

    const task = await taskService.createTask(title, description, projectId, assignedToId, decoded.userId);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}