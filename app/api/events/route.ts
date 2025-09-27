import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/lib/auth';
import { EventService } from '../../../src/services/implementations/EventService';
import { EventRepository } from '../../../src/repositories/implementations/EventRepository';
import { ProjectService } from '../../../src/services/implementations/ProjectService';
import { ProjectRepository } from '../../../src/repositories/implementations/ProjectRepository';

const eventRepository = new EventRepository();
const projectRepository = new ProjectRepository();
const projectService = new ProjectService(projectRepository);
const eventService = new EventService(eventRepository, projectService);

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

    const events = await eventService.getEventsByOwner(decoded.userId);

    return NextResponse.json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
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

    const { title, description, date, time, projectId } = await request.json();

    const event = await eventService.createEvent(title, description, date, time, projectId || null, decoded.userId);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}