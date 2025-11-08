import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/lib/auth';
import { prisma } from '../../../src/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('Token recebido:', token ? 'Presente' : 'Ausente');
    
    if (!token) {
      console.log('Erro: Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log('Token decodificado:', decoded ? 'Válido' : 'Inválido');
    
    if (!decoded) {
      console.log('Erro: Token inválido');
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { title, description, projectId, assignedToId, deadline } = await request.json();

    // Verificar se o projeto existe
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    console.log('Projeto encontrado:', project ? 'Sim' : 'Não');
    if (project) {
      console.log('Nome do projeto:', project.name);
    }

    // Processar deadline corretamente para evitar problemas de fuso horário
    let deadlineDate = null;
    if (deadline) {
      // Se já vem com horário, usar diretamente, senão adicionar horário
      if (deadline.includes('T')) {
        deadlineDate = new Date(deadline);
      } else {
        deadlineDate = new Date(deadline + 'T12:00:00.000Z');
      }
    }

    // Validar se assignedToId é válido
    const finalAssignedToId = assignedToId && assignedToId !== '' ? assignedToId : null;
    console.log('Criando tarefa no banco...');
    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assignedToId: finalAssignedToId,
        createdById: decoded.userId,
        deadline: deadlineDate
      },
      include: {
        assignedTo: true,
        createdBy: true,
        project: true
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('=== ERRO AO CRIAR TAREFA ===');
    console.error('Tipo do erro:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    console.error('=== FIM DO ERRO ===');
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}