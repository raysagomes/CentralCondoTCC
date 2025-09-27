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

    const { name, email, accountType } = await request.json();

    const member = await prisma.user.update({
      where: { id: params.id },
      data: { name, email, accountType },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        createdAt: true
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar membro' }, { status: 500 });
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

    await prisma.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Membro removido com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover membro' }, { status: 500 });
  }
}