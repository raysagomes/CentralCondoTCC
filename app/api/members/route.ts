import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, hashPassword } from '../../../src/lib/auth';
import { prisma } from '../../../src/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Determina o ID da empresa
    const enterpriseId = user.accountType === 'ENTERPRISE' ? user.id : user.enterpriseId;
    
    if (!enterpriseId) {
      return NextResponse.json({ members: [] });
    }

    const members = await prisma.user.findMany({
      where: {
        OR: [
          { id: enterpriseId },
          { enterpriseId: enterpriseId }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        enterpriseId: true,
        createdAt: true
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const creator = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!creator || !['ENTERPRISE', 'ADM'].includes(creator.accountType)) {
      return NextResponse.json({ error: 'Apenas ENTERPRISE e ADM podem criar membros' }, { status: 403 });
    }

    const { name, email, accountType } = await request.json();

    if (!['ADM', 'USER'].includes(accountType)) {
      return NextResponse.json({ error: 'Tipo de conta inválido' }, { status: 400 });
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email já está em uso' }, { status: 409 });
    }

    const temporaryPassword = 'temp123';
    const hashedPassword = await hashPassword(temporaryPassword);
    const hashedSecurityWord = await hashPassword('secret');

    // Determinar o enterpriseId correto
    const enterpriseId = creator.accountType === 'ENTERPRISE' ? creator.id : creator.enterpriseId;

    if (!enterpriseId) {
      return NextResponse.json({ error: 'Enterprise ID não encontrado' }, { status: 400 });
    }

    // Buscar os módulos da empresa
    const enterprise = await prisma.user.findUnique({
      where: { id: enterpriseId },
      select: { modules: true }
    });

    // Garantir que tenha pelo menos os módulos obrigatórios
    const enterpriseModules = enterprise?.modules || JSON.stringify(['avisos', 'calendario', 'equipe']);
    const modules = JSON.parse(enterpriseModules);
    const requiredModules = ['avisos', 'calendario', 'equipe'];
    const finalModules = [...new Set([...modules, ...requiredModules])];

    const member = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        securityWord: hashedSecurityWord,
        accountType,
        enterpriseId,
        modules: JSON.stringify(finalModules)
      },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        enterpriseId: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      ...member,
      temporaryPassword
    });
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    return NextResponse.json({ error: 'Erro ao criar membro' }, { status: 500 });
  }
}