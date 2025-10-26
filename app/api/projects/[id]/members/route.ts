import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../../../src/lib/auth';
import { prisma } from '../../../../../src/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        owner: true,
        members: {
          include: { user: true }
        }
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 });
    }

    // Membros que têm acesso: owner + membros do projeto + enterprise da empresa
    const projectMembers = project.members.map(m => m.user);
    const owner = project.owner;
    
    // Buscar enterprise se não for o próprio owner
    let enterprise = null;
    if (owner.accountType !== 'ENTERPRISE' && owner.enterpriseId) {
      enterprise = await prisma.user.findUnique({
        where: { id: owner.enterpriseId }
      });
    }

    const accessibleMembers = [
      owner,
      ...projectMembers,
      ...(enterprise ? [enterprise] : [])
    ].filter((member, index, self) => 
      self.findIndex(m => m.id === member.id) === index
    );

    return NextResponse.json(accessibleMembers.map(member => ({
      id: member.id,
      name: member.name,
      accountType: member.accountType
    })));
  } catch (error) {
    console.error('Erro ao buscar membros do projeto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}