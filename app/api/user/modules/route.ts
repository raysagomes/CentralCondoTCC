import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/prisma';
import jwt from 'jsonwebtoken';

//modulos do usuario logado
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token)
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    if (!decoded?.userId)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { modules: true },
    });

    const modules = user?.modules ? JSON.parse(user.modules) : [];

    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Erro ao buscar módulos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

//modulos no banco
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token)
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    if (!decoded?.userId)
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    const { modules } = await request.json();

    if (!Array.isArray(modules)) {
      return NextResponse.json(
        { error: 'Formato inválido: esperado array' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: decoded.userId },
      data: { modules: JSON.stringify(modules) },
      select: { modules: true },
    });

    return NextResponse.json({
      success: true,
      modules: JSON.parse(updated.modules ?? '[]'),
    });
  } catch (error) {
    console.error('Erro ao salvar módulos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
