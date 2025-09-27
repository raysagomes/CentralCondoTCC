import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../src/lib/auth';
import { TaskService } from '../../../../src/services/implementations/TaskService';
import { TaskRepository } from '../../../../src/repositories/implementations/TaskRepository';
import { ProjectService } from '../../../../src/services/implementations/ProjectService';
import { ProjectRepository } from '../../../../src/repositories/implementations/ProjectRepository';

const taskRepository = new TaskRepository();
const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);
const taskService = new TaskService(taskRepository, projectService);

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

    const updatedTask = await taskService.updateTask(taskId, updates, decoded.userId);

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

    await taskService.deleteTask(taskId, decoded.userId);

    return NextResponse.json({ message: 'Tarefa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}