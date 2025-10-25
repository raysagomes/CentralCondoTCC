import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hashPassword } from '../../../../src/lib/auth';
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

    const { name, email, accountType, resetPassword, securityWord, newPassword } = await request.json();

    let updateData: any = { name, email, accountType };
    
    if (resetPassword) {
      if (securityWord !== 'admin123') {
        return NextResponse.json({ error: 'Palavra de segurança inválida' }, { status: 403 });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      updateData.password = hashedPassword;
    }

    const member = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        createdAt: true
      }
    });

    const response: any = member;
    if (resetPassword) {
      response.temporaryPassword = 'temp123';
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
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