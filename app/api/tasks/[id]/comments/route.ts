import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../src/lib/auth';
import { prisma } from '../../../../../src/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { taskId: params.id },
      include: { 
        author: { 
          select: { 
            id: true, 
            name: true, 
            accountType: true 
          } 
        } 
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Conteúdo do comentário é obrigatório' }, { status: 400 });
    }

    // Verificar se a tarefa existe
    const task = await prisma.task.findUnique({
      where: { id: params.id }
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        taskId: params.id,
        authorId: decoded.userId
      },
      include: { 
        author: { 
          select: { 
            id: true, 
            name: true, 
            accountType: true 
          } 
        } 
      }
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}