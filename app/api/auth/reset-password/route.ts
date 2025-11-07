import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { hashPassword, comparePassword } from '../../../../src/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, securityWord, newPassword, newSecurityWord } = await request.json();

    if (!email || !securityWord || !newPassword) {
      return NextResponse.json({ error: 'Email, palavra de segurança e nova senha são obrigatórios' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const isSecurityWordValid = await comparePassword(securityWord, user.securityWord);
    if (!isSecurityWordValid) {
      return NextResponse.json({ error: 'Palavra de segurança incorreta' }, { status: 401 });
    }

    const hashedPassword = await hashPassword(newPassword);
    const updateData: any = { password: hashedPassword };
    
    if (newSecurityWord) {
      updateData.securityWord = await hashPassword(newSecurityWord);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({ message: 'Senha alterada com sucesso' }, { status: 200 });

  } catch (error) {
    console.error('Erro no reset de senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}