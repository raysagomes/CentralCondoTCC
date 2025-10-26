# 🚀 Exemplos de Uso das APIs

Este documento contém exemplos práticos de como usar as APIs da plataforma.

## 🔐 Autenticação

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "senha123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "name": "Admin",
    "email": "admin@empresa.com",
    "accountType": "ENTERPRISE"
  }
}
```

## 📁 Projetos

### Listar Projetos
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Criar Projeto
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sistema de Vendas",
    "description": "Desenvolvimento de sistema para controle de vendas"
  }'
```

## ✅ Tarefas

### Criar Tarefa
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar autenticação",
    "description": "Criar sistema de login e registro",
    "projectId": "project-123",
    "assignedToId": "user-456"
  }'
```

## 💰 Pagamentos

### Registrar Pagamento
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "description": "Pagamento tarefa frontend",
    "taskId": "task-123",
    "userId": "user-456"
  }'
```

## 🔔 Notificações

### Listar Notificações
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer <token>"
```

### Marcar como Lida
```bash
curl -X PUT http://localhost:3000/api/notifications/notif-123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"read": true}'
```

## 📊 Dashboard

### Obter Dados do Dashboard
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

**Resposta:**
```json
{
  "totalProjects": 5,
  "totalTasks": 23,
  "completedTasks": 15,
  "pendingPayments": 3,
  "totalRevenue": 15000.00
}
```

## 📅 Eventos

### Criar Evento
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reunião de Sprint",
    "description": "Revisão das tarefas da semana",
    "date": "2024-01-15T10:00:00Z",
    "projectId": "project-123"
  }'
```

## 🔧 JavaScript/TypeScript

### Exemplo com Fetch API
```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  return await response.json();
};

// Buscar projetos
const getProjects = async (token: string) => {
  const response = await fetch('/api/projects', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
};

// Criar tarefa
const createTask = async (token: string, taskData: any) => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskData),
  });
  
  return await response.json();
};
```

## 🐍 Python

### Exemplo com requests
```python
import requests

# Login
def login(email, password):
    response = requests.post('http://localhost:3000/api/auth/login', 
                           json={'email': email, 'password': password})
    return response.json()

# Buscar projetos
def get_projects(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get('http://localhost:3000/api/projects', headers=headers)
    return response.json()

# Criar projeto
def create_project(token, name, description):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    data = {'name': name, 'description': description}
    response = requests.post('http://localhost:3000/api/projects', 
                           json=data, headers=headers)
    return response.json()
```

## ⚠️ Tratamento de Erros

### Exemplo de Resposta de Erro
```json
{
  "error": "Token inválido",
  "status": 401
}
```

### Tratamento em JavaScript
```typescript
const handleApiCall = async () => {
  try {
    const response = await fetch('/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na API');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro:', error.message);
    // Tratar erro conforme necessário
  }
};
```