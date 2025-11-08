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

    // Verificar se o usuário tem acesso ao projeto da tarefa
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            members: { include: { user: true } },
            owner: true
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    const isEnterprise = user?.accountType === 'ENTERPRISE';
    const isOwner = task.project.ownerId === decoded.userId;
    const isMember = task.project.members.some(member => member.userId === decoded.userId);
    const hasEnterpriseAccess = isEnterprise && (task.project.ownerId === decoded.userId || 
      task.project.owner?.enterpriseId === decoded.userId);
    
    if (!isOwner && !isMember && !hasEnterpriseAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
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

    const formData = await request.formData();
    const content = formData.get('content') as string;
    const attachments: string[] = [];

    // Process file uploads
    for (let i = 0; formData.get(`file${i}`); i++) {
      const file = formData.get(`file${i}`) as File;
      if (file) {
        // For now, we'll store file names. In production, upload to cloud storage
        attachments.push(file.name);
      }
    }

    if ((!content || !content.trim()) && attachments.length === 0) {
      return NextResponse.json({ error: 'Conteúdo ou anexos são obrigatórios' }, { status: 400 });
    }

    // Verificar se a tarefa existe e se o usuário tem acesso ao projeto
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            members: { include: { user: true } },
            owner: true
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
    }

    // Verificar acesso ao projeto
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    const isEnterprise = user?.accountType === 'ENTERPRISE';
    const isOwner = task.project.ownerId === decoded.userId;
    const isMember = task.project.members.some(member => member.userId === decoded.userId);
    const hasEnterpriseAccess = isEnterprise && (task.project.ownerId === decoded.userId || 
      task.project.owner?.enterpriseId === decoded.userId);
    
    if (!isOwner && !isMember && !hasEnterpriseAccess) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content?.trim() || '',
        taskId: params.id,
        authorId: decoded.userId,
        attachments: attachments
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