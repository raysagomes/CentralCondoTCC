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

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { title, description, projectId, assignedToId, deadline } = await request.json();

    // Verificar se o usuário pode criar tarefas (ENTERPRISE/ADM ou membro do projeto)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    const canCreateTask = ['ENTERPRISE', 'ADM'].includes(user.accountType) || 
                         project?.members.some(m => m.userId === decoded.userId);

    if (!canCreateTask) {
      return NextResponse.json({ error: 'Sem permissão para criar tarefas neste projeto' }, { status: 403 });
    }

    const task = await taskService.createTask(title, description, projectId, assignedToId, decoded.userId, deadline);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}