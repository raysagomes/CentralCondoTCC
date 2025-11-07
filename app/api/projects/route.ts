import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/lib/auth';
import { ProjectService, ProjectRepository } from '@/modules/projetos';

const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);

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

    const projects = await projectService.getAllUserProjects(decoded.userId);

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
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

    // Verificar permissões do usuário
    const { prisma } = require('../../../src/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !['ENTERPRISE', 'ADM'].includes(user.accountType)) {
      return NextResponse.json({ error: 'Apenas ENTERPRISE e ADM podem criar projetos' }, { status: 403 });
    }

    const { name, description } = await request.json();

    const project = await projectService.createProject(name, description, decoded.userId);

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}