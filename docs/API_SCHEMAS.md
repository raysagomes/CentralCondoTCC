# 📋 Schemas das APIs

Este documento define os schemas de dados utilizados pelas APIs.

## 🔐 Autenticação

### LoginRequest
```typescript
interface LoginRequest {
  email: string;
  password: string;
}
```

### LoginResponse
```typescript
interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    accountType: 'ENTERPRISE' | 'ADM' | 'MEMBER';
    enterpriseId?: string;
    createdAt: string;
  };
}
```

### RegisterRequest
```typescript
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  accountType: 'ENTERPRISE' | 'ADM' | 'MEMBER';
  enterpriseId?: string;
}
```

## 📁 Projetos

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  createdBy: string;
  enterpriseId: string;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
  tasks?: Task[];
}
```

### CreateProjectRequest
```typescript
interface CreateProjectRequest {
  name: string;
  description: string;
}
```

### ProjectMember
```typescript
interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER';
  joinedAt: string;
  user: User;
}
```

## ✅ Tarefas

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId: string;
  assignedToId?: string;
  createdById: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  project: Project;
  assignedTo?: User;
  createdBy: User;
  comments?: TaskComment[];
}
```

### CreateTaskRequest
```typescript
interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: string;
  assignedToId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
}
```

### TaskComment
```typescript
interface TaskComment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  createdAt: string;
  user: User;
}
```

## 👥 Usuários

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  accountType: 'ENTERPRISE' | 'ADM' | 'MEMBER';
  enterpriseId?: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### UpdateUserRequest
```typescript
interface UpdateUserRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}
```

## 💰 Pagamentos

### Payment
```typescript
interface Payment {
  id: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  taskId?: string;
  projectId?: string;
  userId: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  task?: Task;
  project?: Project;
  user: User;
}
```

### CreatePaymentRequest
```typescript
interface CreatePaymentRequest {
  amount: number;
  description: string;
  taskId?: string;
  projectId?: string;
  userId: string;
  dueDate?: string;
}
```

## 🔔 Notificações

### Notification
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  userId: string;
  read: boolean;
  relatedId?: string;
  relatedType?: 'PROJECT' | 'TASK' | 'PAYMENT';
  createdAt: string;
  user: User;
}
```

### CreateNotificationRequest
```typescript
interface CreateNotificationRequest {
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  userId: string;
  relatedId?: string;
  relatedType?: 'PROJECT' | 'TASK' | 'PAYMENT';
}
```

## 📢 Avisos

### Announcement
```typescript
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'GENERAL' | 'URGENT' | 'MAINTENANCE';
  isActive: boolean;
  createdById: string;
  enterpriseId: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
}
```

### CreateAnnouncementRequest
```typescript
interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: 'GENERAL' | 'URGENT' | 'MAINTENANCE';
  expiresAt?: string;
}
```

## 📅 Eventos

### Event
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  projectId?: string;
  createdById: string;
  attendees?: string[];
  location?: string;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  createdBy: User;
}
```

### CreateEventRequest
```typescript
interface CreateEventRequest {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  projectId?: string;
  attendees?: string[];
  location?: string;
}
```

## 📊 Dashboard

### DashboardStats
```typescript
interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalPayments: number;
  pendingPayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  teamMembers: number;
  recentActivities: Activity[];
}
```

### Activity
```typescript
interface Activity {
  id: string;
  type: 'PROJECT_CREATED' | 'TASK_COMPLETED' | 'PAYMENT_MADE' | 'MEMBER_JOINED';
  description: string;
  userId: string;
  relatedId?: string;
  createdAt: string;
  user: User;
}
```

## ⚠️ Respostas de Erro

### ErrorResponse
```typescript
interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
}
```

### ValidationError
```typescript
interface ValidationError {
  error: string;
  field: string;
  message: string;
}
```

## 📝 Enums

### AccountType
```typescript
enum AccountType {
  ENTERPRISE = 'ENTERPRISE',
  ADM = 'ADM',
  MEMBER = 'MEMBER'
}
```

### TaskStatus
```typescript
enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}
```

### Priority
```typescript
enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}
```

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}
```

### NotificationType
```typescript
enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}
```