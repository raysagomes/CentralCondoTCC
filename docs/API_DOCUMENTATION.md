# 📚 Documentação das APIs

Esta documentação descreve todas as APIs disponíveis na plataforma de gestão de equipes e projetos.

## 🔐 Autenticação

Todas as rotas protegidas requerem um token JWT no header:
```
Authorization: Bearer <token>
```

## 📋 Índice

- [Autenticação](#autenticação-1)
- [Projetos](#projetos)
- [Tarefas](#tarefas)
- [Membros](#membros)
- [Pagamentos](#pagamentos)
- [Notificações](#notificações)
- [Avisos](#avisos)
- [Eventos](#eventos)
- [Dashboard](#dashboard)
- [Usuário](#usuário)

---

## 🔐 Autenticação

### POST `/api/auth/login`
Realiza login do usuário.

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "accountType": "ENTERPRISE | ADM | MEMBER",
    "enterpriseId": "string",
    "createdAt": "datetime"
  }
}
```

### POST `/api/auth/register`
Registra novo usuário.

### POST `/api/auth/change-password`
Altera senha do usuário.

### POST `/api/auth/reset-password`
Solicita reset de senha.

---

## 📁 Projetos

### GET `/api/projects`
Lista todos os projetos do usuário.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
]
```

### POST `/api/projects`
Cria novo projeto (apenas ENTERPRISE e ADM).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

### GET `/api/projects/[id]`
Busca projeto específico.

### PUT `/api/projects/[id]`
Atualiza projeto.

### DELETE `/api/projects/[id]`
Remove projeto.

### GET `/api/projects/[id]/members`
Lista membros do projeto.

### POST `/api/projects/[id]/members`
Adiciona membro ao projeto.

---

## ✅ Tarefas

### POST `/api/tasks`
Cria nova tarefa (apenas ENTERPRISE e ADM).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "string",
  "description": "string",
  "projectId": "string",
  "assignedToId": "string"
}
```

### GET `/api/tasks/[id]`
Busca tarefa específica.

### PUT `/api/tasks/[id]`
Atualiza tarefa.

### DELETE `/api/tasks/[id]`
Remove tarefa.

### GET `/api/tasks/[id]/comments`
Lista comentários da tarefa.

### POST `/api/tasks/[id]/comments`
Adiciona comentário à tarefa.

---

## 👥 Membros

### GET `/api/members`
Lista todos os membros.

### GET `/api/members/[id]`
Busca membro específico.

### PUT `/api/members/[id]`
Atualiza dados do membro.

### DELETE `/api/members/[id]`
Remove membro.

---

## 💰 Pagamentos

### GET `/api/payments`
Lista todos os pagamentos.

### POST `/api/payments`
Registra novo pagamento.

### GET `/api/payments/[id]`
Busca pagamento específico.

### PUT `/api/payments/[id]`
Atualiza pagamento.

### DELETE `/api/payments/[id]`
Remove pagamento.

---

## 🔔 Notificações

### GET `/api/notifications`
Lista notificações do usuário.

### POST `/api/notifications`
Cria nova notificação.

### GET `/api/notifications/[id]`
Busca notificação específica.

### PUT `/api/notifications/[id]`
Marca notificação como lida.

### DELETE `/api/notifications/[id]`
Remove notificação.

---

## 📢 Avisos

### GET `/api/announcements`
Lista todos os avisos.

### POST `/api/announcements`
Cria novo aviso.

---

## 📅 Eventos

### GET `/api/events`
Lista todos os eventos.

### POST `/api/events`
Cria novo evento.

### GET `/api/events/[id]`
Busca evento específico.

### PUT `/api/events/[id]`
Atualiza evento.

### DELETE `/api/events/[id]`
Remove evento.

---

## 📊 Dashboard

### GET `/api/dashboard`
Retorna dados do dashboard.

---

## 👤 Usuário

### GET `/api/user`
Retorna dados do usuário logado.

### PUT `/api/user`
Atualiza dados do usuário.

---

## 📝 Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 🔑 Tipos de Conta

- `ENTERPRISE` - Pode criar projetos e tarefas
- `ADM` - Pode criar projetos e tarefas
- `MEMBER` - Apenas visualização e execução de tarefas