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

    const { name, description, memberIds } = await request.json();

    // Verificar se o projeto existe e se o usuário tem permissão
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { 
        members: true,
        owner: true
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    const isOwner = project.ownerId === decoded.userId;
    const isEnterprise = user?.accountType === 'ENTERPRISE' && 
      (project.ownerId === decoded.userId || project.owner?.enterpriseId === decoded.userId);

    if (!isOwner && !isEnterprise) {
      return NextResponse.json({ error: 'Sem permissão para editar este projeto' }, { status: 403 });
    }

    // Atualizar projeto e membros em uma transação
    const updatedProject = await prisma.$transaction(async (tx) => {
      // Atualizar dados básicos do projeto
      const updated = await tx.project.update({
        where: { id: params.id },
        data: { name, description }
      });

      // Se memberIds foi fornecido, atualizar membros
      if (memberIds !== undefined) {
        // Remover membros atuais
        await tx.projectMember.deleteMany({
          where: { projectId: params.id }
        });

        // Adicionar novos membros
        if (memberIds.length > 0) {
          await tx.projectMember.createMany({
            data: memberIds.map((userId: string) => ({
              projectId: params.id,
              userId
            }))
          });
        }
      }

      return tx.project.findUnique({
        where: { id: params.id },
        include: {
          members: { include: { user: true } }
        }
      });
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}