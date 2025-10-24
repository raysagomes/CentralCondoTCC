import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/lib/prisma';
import { verifyToken } from '../../../src/lib/auth';

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

    const payments = await prisma.payment.findMany({
      orderBy: { dueDate: 'asc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
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

    const { title, amount, dueDate, barcode, link, type } = await request.json();

    // Validações específicas
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Campo Título é obrigatório' }, { status: 400 });
    }
    
    if (title.trim().length < 3) {
      return NextResponse.json({ error: 'Campo Título deve ter pelo menos 3 caracteres' }, { status: 400 });
    }
    
    if (!amount) {
      return NextResponse.json({ error: 'Campo Valor é obrigatório' }, { status: 400 });
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Campo Valor deve ser um número maior que R$ 0,00' }, { status: 400 });
    }
    
    if (numAmount > 999999.99) {
      return NextResponse.json({ error: 'Campo Valor não pode ser maior que R$ 999.999,99' }, { status: 400 });
    }
    
    if (!dueDate) {
      return NextResponse.json({ error: 'Campo Data de Vencimento é obrigatório' }, { status: 400 });
    }
    
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return NextResponse.json({ error: 'Campo Data de Vencimento com formato inválido' }, { status: 400 });
    }
    
    // Pelo menos um dos dois deve ser preenchido
    const hasBarcode = barcode && barcode.trim();
    const hasLink = link && link.trim();
    
    if (!hasBarcode && !hasLink) {
      return NextResponse.json({ error: 'Preencha pelo menos um: Código de Barras ou Link de Pagamento' }, { status: 400 });
    }
    
    // Validação do código de barras se preenchido
    if (hasBarcode) {
      const digits = barcode.replace(/\D/g, '');
      if (digits.length !== 47) {
        return NextResponse.json({ error: `Campo Código de Barras deve ter 47 dígitos, atual: ${digits.length}` }, { status: 400 });
      }
    }
    
    // Validação do link se preenchido
    if (hasLink && link.length < 10) {
      return NextResponse.json({ error: 'Campo Link de Pagamento deve ter pelo menos 10 caracteres' }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        title,
        amount: numAmount,
        dueDate: new Date(dueDate),
        barcode: barcode || null,
        link: link || null,
        type: type || 'other',
        paid: false
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe um pagamento com estes dados' }, { status: 400 });
    }
    
    if (error.name === 'PrismaClientValidationError') {
      if (error.message.includes('title')) {
        return NextResponse.json({ error: 'Título é obrigatório e deve ser um texto válido' }, { status: 400 });
      }
      if (error.message.includes('amount')) {
        return NextResponse.json({ error: 'Valor deve ser um número maior que zero' }, { status: 400 });
      }
      if (error.message.includes('dueDate')) {
        return NextResponse.json({ error: 'Data de vencimento deve estar no formato válido (AAAA-MM-DD)' }, { status: 400 });
      }
      if (error.message.includes('link')) {
        return NextResponse.json({ error: 'Código de barras deve estar no formato correto' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Dados fornecidos estão em formato inválido' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}