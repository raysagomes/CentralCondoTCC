import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { hashPassword, generateToken } from '../../../../src/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, securityWord } = await request.json();

    // 🔹 Validação básica
    if (!name || !email || !password || !securityWord) {
      return NextResponse.json(
        { error: 'Nome, email, senha e palavra de segurança são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (securityWord.trim().length < 3) {
      return NextResponse.json(
        { error: 'A palavra de segurança deve ter pelo menos 3 caracteres' },
        { status: 400 }
      );
    }

    // 🔹 Verifica se já existe usuário com o mesmo e-mail
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    // 🔹 Criptografa senha e palavra de segurança
    const hashedPassword = await hashPassword(password);
    const hashedSecurityWord = await hashPassword(securityWord);

    // 🔹 Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        securityWord: hashedSecurityWord,
        accountType: 'COMPANY', // ou 'ENTERPRISE' se preferir
      },
    });

    // 🔹 Gera o token JWT
    const token = generateToken(user.id);

    // 🔹 Retorna o usuário criado
    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          accountType: user.accountType,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
