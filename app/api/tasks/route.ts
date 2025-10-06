import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/lib/auth';
import { TaskService } from '../../../src/services/implementations/TaskService';
import { TaskRepository } from '../../../src/repositories/implementations/TaskRepository';
import { ProjectService } from '../../../src/services/implementations/ProjectService';
import { ProjectRepository } from '../../../src/repositories/implementations/ProjectRepository';

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

    const { title, description, projectId, assignedToId } = await request.json();

    const task = await taskService.createTask(title, description, projectId, assignedToId, decoded.userId);

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}