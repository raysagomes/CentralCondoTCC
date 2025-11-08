# Documentação da API

Esta documentação descreve todas as APIs disponíveis para a plataforma de gestão de equipes e projetos.

## Autenticação

Todas as rotas protegidas requerem um token JWT no cabeçalho:
```
Authorization: Bearer <token>
```

## Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Tipos de Conta

- `ENTERPRISE` - Pode criar projetos e tarefas
- `ADM` - Pode criar projetos e tarefas
- `MEMBER` - Apenas visualizar e executar tarefas

---

## Autenticação

### POST /api/auth/login

**Descrição:**  
Autentica um usuário e retorna um token JWT válido

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Content-Type | application/json | Tipo de conteúdo da requisição |

**Corpo da Requisição:**
```json
{
  "email": "user@domain.com",
  "password": "password123"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "user": {
    "id": "user-123",
    "name": "User Name",
    "email": "user@domain.com",
    "accountType": "ENTERPRISE",
    "enterpriseId": "enterprise-123",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Resposta 401:**
```json
{
  "error": "Credenciais inválidas"
}
```

### POST /api/auth/register

**Descrição:**  
Registra um novo usuário no sistema

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Content-Type | application/json | Tipo de conteúdo da requisição |

**Corpo da Requisição:**
```json
{
  "name": "User Name",
  "email": "user@domain.com",
  "password": "password123",
  "accountType": "ENTERPRISE",
  "enterpriseId": "enterprise-123"
}
```

**Resposta 201:**
```json
{
  "message": "Usuário criado com sucesso"
}
```

### POST /api/auth/change-password

**Descrição:**  
Altera a senha do usuário

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |
| Content-Type | application/json | Tipo de conteúdo da requisição |

**Corpo da Requisição:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Resposta 200:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

### POST /api/auth/reset-password

**Descrição:**  
Solicita uma redefinição de senha

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Content-Type | application/json | Tipo de conteúdo da requisição |

**Corpo da Requisição:**
```json
{
  "email": "user@domain.com"
}
```

**Resposta 200:**
```json
{
  "message": "Email de recuperação enviado"
}
```

---

## Projetos

### GET /api/projects

**Descrição:**  
Lista todos os projetos para o usuário autenticado

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |

**Resposta 200:**
```json
[
  {
    "id": "project-123",
    "name": "Project Name",
    "description": "Project description",
    "status": "ACTIVE",
    "createdBy": "user-123",
    "enterpriseId": "enterprise-123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### POST /api/projects

**Descrição:**  
Cria um novo projeto (apenas ENTERPRISE e ADM)

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |
| Content-Type | application/json | Tipo de conteúdo da requisição |

**Corpo da Requisição:**
```json
{
  "name": "Project Name",
  "description": "Project description"
}
```

**Resposta 201:**
```json
{
  "id": "project-123",
  "name": "Project Name",
  "description": "Project description",
  "status": "ACTIVE",
  "createdBy": "user-123",
  "enterpriseId": "enterprise-123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Resposta 403:**
```json
{
  "error": "Apenas ENTERPRISE e ADM podem criar projetos"
}
```

### GET /api/projects/{id}

**Descrição:**  
Recupera um projeto específico por ID

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do projeto |

**Resposta 200:**
```json
{
  "id": "project-123",
  "name": "Project Name",
  "description": "Project description",
  "status": "ACTIVE",
  "createdBy": "user-123",
  "enterpriseId": "enterprise-123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /api/projects/{id}

**Descrição:**  
Atualiza um projeto específico

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |
| Content-Type | application/json | Tipo de conteúdo da requisição |

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do projeto |

**Corpo da Requisição:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "COMPLETED"
}
```

**Resposta 200:**
```json
{
  "id": "project-123",
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "COMPLETED",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### DELETE /api/projects/{id}

**Descrição:**  
Deleta um projeto específico

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do projeto |

**Resposta 200:**
```json
{
  "message": "Projeto removido com sucesso"
}
```

### GET /api/projects/{id}/members

**Descrição:**  
Lista todos os membros de um projeto específico

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do projeto |

**Resposta 200:**
```json
[
  {
    "id": "member-123",
    "projectId": "project-123",
    "userId": "user-123",
    "role": "MEMBER",
    "joinedAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "user-123",
      "name": "User Name",
      "email": "user@domain.com"
    }
  }
]
```

### POST /api/projects/{id}/members

**Descrição:**  
Adiciona um membro a um projeto específico

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |
| Content-Type | application/json | Tipo de conteúdo da requisição |

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID do projeto |

**Corpo da Requisição:**
```json
{
  "userId": "user-123",
  "role": "MEMBER"
}
```

**Resposta 201:**
```json
{
  "id": "member-123",
  "projectId": "project-123",
  "userId": "user-123",
  "role": "MEMBER",
  "joinedAt": "2024-01-01T00:00:00.000Z"
}
```

---

## Tarefas

### POST /api/tasks

**Descrição:**  
Cria uma nova tarefa (apenas ENTERPRISE e ADM)

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |
| Content-Type | application/json | Tipo de conteúdo da requisição |

**Corpo da Requisição:**
```json
{
  "title": "Task Title",
  "description": "Task description",
  "projectId": "project-123",
  "assignedToId": "user-123",
  "deadline": "2024-12-31T23:59:59.000Z"
}
```

**Resposta 201:**
```json
{
  "id": "task-123",
  "title": "Task Title",
  "description": "Task description",
  "status": "PENDING",
  "priority": "MEDIUM",
  "projectId": "project-123",
  "assignedToId": "user-123",
  "createdById": "user-456",
  "deadline": "2024-12-31T23:59:59.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/tasks/{id}

**Descrição:**  
Recupera uma tarefa específica por ID

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da tarefa |

**Resposta 200:**
```json
{
  "id": "task-123",
  "title": "Task Title",
  "description": "Task description",
  "status": "PENDING",
  "priority": "MEDIUM",
  "projectId": "project-123",
  "assignedToId": "user-123",
  "createdById": "user-456",
  "deadline": "2024-12-31T23:59:59.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /api/tasks/{id}

**Descrição:**  
Atualiza uma tarefa específica

**Cabeçalhos:**
| Chave | Valor | Descrição |
|-----|--------|-------------|
| Authorization | Bearer <token> | Token de autenticação JWT |
| Content-Type | application/json | Tipo de conteúdo da requisição |

**Parâmetros de Rota:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da tarefa |

**Corpo da Requisição:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "HIGH"
}
```

**Resposta 200:**
```json
{
  "id": "task-123",
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```