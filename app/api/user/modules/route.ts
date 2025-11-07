import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('📦 Recebido /api/user/modules:', body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro em /api/user/modules:', error);
    return NextResponse.json({ error: 'Erro ao salvar módulos' }, { status: 400 });
  }
}