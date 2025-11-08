# Esquemas da API

Este documento define os esquemas de dados utilizados pelas APIs.

## Esquemas de Autenticação

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

### ChangePasswordRequest
```typescript
interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
```

### ResetPasswordRequest
```typescript
interface ResetPasswordRequest {
  email: string;
}
```

## Esquemas de Projeto

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

### UpdateProjectRequest
```typescript
interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
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

### AddProjectMemberRequest
```typescript
interface AddProjectMemberRequest {
  userId: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER';
}
```

## Esquemas de Tarefa

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId: string;
  assignedToId?: string;
  createdById: string;
  deadline?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  project: Project;
  assignedTo?: User;
  createdBy: User;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
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
  deadline?: string;
}
```

### UpdateTaskRequest
```typescript
interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  assignedToId?: string;
  deadline?: string;
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
  updatedAt: string;
  user: User;
}
```

### CreateTaskCommentRequest
```typescript
interface CreateTaskCommentRequest {
  content: string;
}
```

### TaskAttachment
```typescript
interface TaskAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  taskId: string;
  uploadedById: string;
  createdAt: string;
  uploadedBy: User;
}
```

## Esquemas de Usuário

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

### CreateMemberRequest
```typescript
interface CreateMemberRequest {
  name: string;
  email: string;
  accountType: 'ADM' | 'MEMBER';
}
```

### CreateMemberResponse
```typescript
interface CreateMemberResponse {
  id: string;
  name: string;
  email: string;
  accountType: 'ADM' | 'MEMBER';
  enterpriseId: string;
  createdAt: string;
  temporaryPassword: string;
}
```

## Esquemas de Pagamento

### Payment
```typescript
interface Payment {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  barcode?: string;
  link?: string;
  paid: boolean;
  paidAt?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: User;
}
```

### CreatePaymentRequest
```typescript
interface CreatePaymentRequest {
  title: string;
  amount: number;
  dueDate: string;
  barcode?: string;
  link?: string;
}
```

### UpdatePaymentRequest
```typescript
interface UpdatePaymentRequest {
  title?: string;
  amount?: number;
  dueDate?: string;
  barcode?: string;
  link?: string;
  paid?: boolean;
}
```

## Esquemas de Notificação

### Notification
```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'PAYMENT' | 'EVENT' | 'ALERT' | 'INFO';
  userId: string;
  status: 'unread' | 'read';
  paymentId?: string;
  eventId?: string;
  taskId?: string;
  createdAt: string;
  user: User;
  payment?: Payment;
  event?: Event;
  task?: Task;
}
```

### MarkNotificationReadRequest
```typescript
interface MarkNotificationReadRequest {
  notificationId: string;
}
```

## Esquemas de Anúncio

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

### UpdateAnnouncementRequest
```typescript
interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  type?: 'GENERAL' | 'URGENT' | 'MAINTENANCE';
  isActive?: boolean;
  expiresAt?: string;
}
```

## Esquemas de Evento

### Event
```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  projectId?: string;
  createdById: string;
  enterpriseId: string;
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
  date: string;
  location?: string;
  projectId?: string;
}
```

### UpdateEventRequest
```typescript
interface UpdateEventRequest {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  projectId?: string;
}
```

## Esquemas do Dashboard

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

## Esquemas de Resposta de Erro

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

## Definições de Enum

### AccountType
```typescript
enum AccountType {
  ENTERPRISE = 'ENTERPRISE',
  ADM = 'ADM',
  MEMBER = 'MEMBER'
}
```

### ProjectStatus
```typescript
enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED'
}
```

### TaskStatus
```typescript
enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}
```

### TaskPriority
```typescript
enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}
```

### ProjectMemberRole
```typescript
enum ProjectMemberRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER'
}
```

### NotificationType
```typescript
enum NotificationType {
  PAYMENT = 'PAYMENT',
  EVENT = 'EVENT',
  ALERT = 'ALERT',
  INFO = 'INFO'
}
```

### NotificationStatus
```typescript
enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read'
}
```

### AnnouncementType
```typescript
enum AnnouncementType {
  GENERAL = 'GENERAL',
  URGENT = 'URGENT',
  MAINTENANCE = 'MAINTENANCE'
}
```

### ActivityType
```typescript
enum ActivityType {
  PROJECT_CREATED = 'PROJECT_CREATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  PAYMENT_MADE = 'PAYMENT_MADE',
  MEMBER_JOINED = 'MEMBER_JOINED'
}
```

## Regras de Validação

### Validação de Campos
```typescript
interface ValidationRules {
  email: {
    required: true;
    format: 'email';
    maxLength: 255;
  };
  password: {
    required: true;
    minLength: 6;
    maxLength: 100;
  };
  name: {
    required: true;
    minLength: 2;
    maxLength: 100;
  };
  title: {
    required: true;
    minLength: 3;
    maxLength: 200;
  };
  description: {
    maxLength: 1000;
  };
  amount: {
    required: true;
    min: 0.01;
    max: 999999.99;
  };
}
```