import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hashPassword, comparePassword } from '../../../../src/lib/auth';
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

    const { name, email, accountType, resetPassword, securityWord } = await request.json();

    let updateData: any = { name, email, accountType };
    
    if (resetPassword) {
      // Verificar se o usuário que está fazendo o reset é ENTERPRISE
      const requestingUser = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!requestingUser || requestingUser.accountType !== 'ENTERPRISE') {
        return NextResponse.json({ error: 'Apenas usuários Enterprise podem resetar senhas' }, { status: 403 });
      }
      
      // Buscar o usuário cujo senha será resetada
      const targetUser = await prisma.user.findUnique({
        where: { id: params.id }
      });
      
      if (!targetUser) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
      
      // Verificar a security word do usuário cujo senha será resetada
      const isSecurityWordValid = await comparePassword(securityWord, targetUser.securityWord);
      if (!isSecurityWordValid) {
        return NextResponse.json({ error: 'Palavra de segurança incorreta' }, { status: 403 });
      }
      
      // Resetar para temp123
      const hashedPassword = await hashPassword('temp123');
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