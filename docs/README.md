# 📚 Documentação das APIs

Bem-vindo à documentação completa das APIs da **Plataforma de Gestão de Equipes e Projetos**.

## 📋 Estrutura da Documentação

### 📖 [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
Documentação principal com todas as rotas disponíveis, métodos HTTP, parâmetros e respostas.

### 🚀 [API_EXAMPLES.md](./API_EXAMPLES.md)
Exemplos práticos de uso das APIs com curl, JavaScript/TypeScript e Python.

### 📋 [API_SCHEMAS.md](./API_SCHEMAS.md)
Definições detalhadas dos schemas de dados, interfaces TypeScript e enums.

## 🔗 Links Rápidos

- **Base URL**: `http://localhost:3000/api`
- **Autenticação**: JWT Bearer Token
- **Formato**: JSON

## 🚀 Início Rápido

1. **Faça login** para obter o token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@empresa.com", "password": "senha123"}'
```

2. **Use o token** nas requisições:
```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer <seu-token>"
```

## 📊 Principais Endpoints

| Recurso | Endpoint | Descrição |
|---------|----------|-----------|
| 🔐 Auth | `/api/auth/*` | Autenticação e autorização |
| 📁 Projetos | `/api/projects` | Gestão de projetos |
| ✅ Tarefas | `/api/tasks` | Gestão de tarefas |
| 👥 Membros | `/api/members` | Gestão de membros |
| 💰 Pagamentos | `/api/payments` | Controle financeiro |
| 🔔 Notificações | `/api/notifications` | Sistema de notificações |
| 📢 Avisos | `/api/announcements` | Avisos gerais |
| 📅 Eventos | `/api/events` | Calendário de eventos |
| 📊 Dashboard | `/api/dashboard` | Dados estatísticos |

## 🔑 Tipos de Usuário

- **ENTERPRISE**: Criação de projetos e tarefas
- **ADM**: Administração completa
- **MEMBER**: Execução de tarefas

## 📝 Códigos de Status

- `200` - Sucesso
- `201` - Criado
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno

## 🛠️ Ferramentas Recomendadas

- **Postman**: Para testes de API
- **Insomnia**: Cliente REST alternativo
- **curl**: Linha de comando
- **Thunder Client**: Extensão VS Code

## 📞 Suporte

Para dúvidas ou problemas com as APIs, consulte a documentação completa ou entre em contato com a equipe de desenvolvimento.