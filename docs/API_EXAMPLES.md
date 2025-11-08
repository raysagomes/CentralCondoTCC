# Exemplos de Uso da API

Este documento contém exemplos práticos de como usar as APIs da plataforma.

## Autenticação

### Exemplo de Login

**cURL:**
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

### Exemplo de Registro

**cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Usuário",
    "email": "novousuario@empresa.com",
    "password": "senha123",
    "accountType": "MEMBER"
  }'
```

## Projetos

### Listar Projetos

**cURL:**
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Criar Projeto

**cURL:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sistema de Vendas",
    "description": "Desenvolvimento de sistema para controle de vendas"
  }'
```

### Atualizar Projeto

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/projects/project-123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sistema de Vendas Atualizado",
    "description": "Descrição atualizada",
    "status": "COMPLETED"
  }'
```

## Tarefas

### Criar Tarefa

**cURL:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implementar autenticação",
    "description": "Criar sistema de login e registro",
    "projectId": "project-123",
    "assignedToId": "user-456",
    "deadline": "2024-12-31T23:59:59.000Z"
  }'
```

### Obter Minhas Tarefas

**cURL:**
```bash
curl -X GET http://localhost:3000/api/tasks/my-tasks \
  -H "Authorization: Bearer <token>"
```

### Atualizar Status da Tarefa

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/tasks/task-123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

### Adicionar Comentário à Tarefa

**cURL:**
```bash
curl -X POST http://localhost:3000/api/tasks/task-123/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Tarefa concluída com sucesso"
  }'
```

## Membros

### Listar Membros

**cURL:**
```bash
curl -X GET http://localhost:3000/api/members \
  -H "Authorization: Bearer <token>"
```

### Criar Membro

**cURL:**
```bash
curl -X POST http://localhost:3000/api/members \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Membro",
    "email": "membro@empresa.com",
    "accountType": "ADM"
  }'
```

## Pagamentos

### Listar Pagamentos

**cURL:**
```bash
curl -X GET http://localhost:3000/api/payments \
  -H "Authorization: Bearer <token>"
```

### Criar Pagamento

**cURL:**
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Pagamento tarefa frontend",
    "amount": 1500.00,
    "dueDate": "2024-12-31",
    "barcode": "12345678901234567890",
    "link": "https://payment-link.com"
  }'
```

### Atualizar Pagamento

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/payments/payment-123 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paid": true
  }'
```

## Notificações

### Listar Notificações

**cURL:**
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer <token>"
```

### Marcar Notificação como Lida

**cURL:**
```bash
curl -X PATCH http://localhost:3000/api/notifications \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationId": "notification-123"
  }'
```

## Eventos

### Listar Eventos

**cURL:**
```bash
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer <token>"
```

### Criar Evento

**cURL:**
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reunião de Sprint",
    "description": "Revisão das tarefas da semana",
    "date": "2024-01-15T10:00:00Z",
    "location": "Sala de Reunião",
    "projectId": "project-123"
  }'
```

## Anúncios

### Listar Anúncios

**cURL:**
```bash
curl -X GET http://localhost:3000/api/announcements \
  -H "Authorization: Bearer <token>"
```

### Criar Anúncio

**cURL:**
```bash
curl -X POST http://localhost:3000/api/announcements \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sistema em Manutenção",
    "content": "O sistema ficará indisponível das 02:00 às 04:00",
    "type": "MAINTENANCE",
    "expiresAt": "2024-01-15T04:00:00Z"
  }'
```

## Dashboard

### Obter Dados do Dashboard

**cURL:**
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer <token>"
```

**Resposta:**
```json
{
  "totalProjects": 5,
  "activeProjects": 3,
  "totalTasks": 23,
  "completedTasks": 15,
  "pendingTasks": 8,
  "totalPayments": 10,
  "pendingPayments": 3,
  "totalRevenue": 15000.00,
  "monthlyRevenue": 3000.00,
  "teamMembers": 8
}
```

## Perfil do Usuário

### Obter Perfil do Usuário

**cURL:**
```bash
curl -X GET http://localhost:3000/api/user \
  -H "Authorization: Bearer <token>"
```

### Atualizar Perfil do Usuário

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/user \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome Atualizado",
    "phone": "+1234567890"
  }'
```

## Exemplos JavaScript/TypeScript

### Serviço de Autenticação

```typescript
class AuthService {
  private baseUrl = 'http://localhost:3000/api';

  // Realiza login do usuário
  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Falha no login');
    }
    
    return await response.json();
  }

  // Registra novo usuário
  async register(userData: {
    name: string;
    email: string;
    password: string;
    accountType: string;
  }) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Falha no registro');
    }
    
    return await response.json();
  }
}
```

### Cliente da API

```typescript
class ApiClient {
  private baseUrl = 'http://localhost:3000/api';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Método genérico para requisições
  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha na requisição da API');
    }

    return await response.json();
  }

  // Projetos
  async getProjects() {
    return this.request('/projects');
  }

  async createProject(projectData: { name: string; description: string }) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // Tarefas
  async getMyTasks() {
    return this.request('/tasks/my-tasks');
  }

  async createTask(taskData: {
    title: string;
    description: string;
    projectId: string;
    assignedToId?: string;
    deadline?: string;
  }) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTaskStatus(taskId: string, status: string) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Pagamentos
  async getPayments() {
    return this.request('/payments');
  }

  async createPayment(paymentData: {
    title: string;
    amount: number;
    dueDate: string;
    barcode?: string;
    link?: string;
  }) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Notificações
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request('/notifications', {
      method: 'PATCH',
      body: JSON.stringify({ notificationId }),
    });
  }
}
```

### Exemplo de Uso

```typescript
// Inicializar serviços
const authService = new AuthService();

// Login
try {
  const loginResult = await authService.login('user@domain.com', 'password123');
  const { token, user } = loginResult;
  
  // Inicializar cliente da API com token
  const apiClient = new ApiClient(token);
  
  // Obter projetos do usuário
  const projects = await apiClient.getProjects();
  console.log('Projetos:', projects);
  
  // Criar nova tarefa
  const newTask = await apiClient.createTask({
    title: 'Nova Tarefa',
    description: 'Descrição da tarefa',
    projectId: projects[0].id,
    deadline: '2024-12-31T23:59:59.000Z'
  });
  console.log('Tarefa criada:', newTask);
  
  // Obter notificações
  const notifications = await apiClient.getNotifications();
  console.log('Notificações:', notifications);
  
} catch (error) {
  console.error('Erro:', error.message);
}
```



## Exemplos de Tratamento de Erro

### Tratamento de Erro JavaScript

```typescript
async function handleApiCall() {
  try {
    const response = await fetch('/api/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha na requisição da API');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro da API:', error.message);
    
    // Tratar casos específicos de erro
    if (error.message.includes('Token')) {
      // Redirecionar para login
      window.location.href = '/auth';
    } else if (error.message.includes('403')) {
      // Mostrar mensagem de acesso negado
      alert('Acesso negado');
    } else {
      // Mostrar erro genérico
      alert('Ocorreu um erro. Tente novamente.');
    }
  }
}
```

