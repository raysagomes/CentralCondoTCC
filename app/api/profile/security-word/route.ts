import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { hashPassword, comparePassword } from '../../../../src/lib/auth';
import jwt from 'jsonwebtoken';

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { currentSecurityWord, newSecurityWord } = await request.json();

    if (!currentSecurityWord || !newSecurityWord) {
      return NextResponse.json({ error: 'Palavra de segurança atual e nova são obrigatórias' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const isCurrentSecurityWordValid = await comparePassword(currentSecurityWord, user.securityWord);
    if (!isCurrentSecurityWordValid) {
      return NextResponse.json({ error: 'Palavra de segurança atual incorreta' }, { status: 401 });
    }

    const hashedNewSecurityWord = await hashPassword(newSecurityWord);

    await prisma.user.update({
      where: { id: user.id },
      data: { securityWord: hashedNewSecurityWord }
    });

    return NextResponse.json({ message: 'Palavra de segurança alterada com sucesso' }, { status: 200 });

  } catch (error) {
    console.error('Erro ao alterar palavra de segurança:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}