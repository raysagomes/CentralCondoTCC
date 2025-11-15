import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import { hashPassword, generateToken } from '../../../../src/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, securityWord } = await request.json();
    
    console.log('Dados recebidos:', { name, email, password: password ? '***' : undefined, securityWord: securityWord ? '***' : undefined });

    //  Validação básica
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      );
    }
    if (!securityWord) {
      return NextResponse.json(
        { error: 'Palavra de segurança é obrigatória' },
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

    //  Verifica se já existe usuário com o mesmo e-mail
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 409 }
      );
    }

    //  Criptografa senha e palavra de segurança
    const hashedPassword = await hashPassword(password);
    const hashedSecurityWord = await hashPassword(securityWord);

    //  Cria o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        securityWord: hashedSecurityWord,
        accountType: 'ENTERPRISE'
      }
    });

    const token = generateToken(user.id);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        createdAt: user.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
