import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest, { params }: { params: { id: string, commentId: string } }) {
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
      return NextResponse.json({ error: 'Conteúdo é obrigatório' }, { status: 400 });
    }

    // Verificar se o comentário existe e se o usuário é o autor
    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      include: { author: true }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 });
    }

    if (comment.authorId !== decoded.userId) {
      return NextResponse.json({ error: 'Apenas o autor pode editar o comentário' }, { status: 403 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: params.commentId },
      data: { 
        content: content.trim(),
        updatedAt: new Date()
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

    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error('Erro ao editar comentário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string, commentId: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar se o comentário existe e se o usuário é o autor
    const comment = await prisma.comment.findUnique({
      where: { id: params.commentId },
      include: { author: true }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 });
    }

    if (comment.authorId !== decoded.userId) {
      return NextResponse.json({ error: 'Apenas o autor pode deletar o comentário' }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: params.commentId }
    });

    return NextResponse.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}