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

    const members = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
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

    const { name, email, accountType } = await request.json();

    const hashedPassword = await hashPassword('temp123');

    const member = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accountType: accountType || 'USER'
      },
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
    return NextResponse.json({ error: 'Erro ao criar membro' }, { status: 500 });
  }
}