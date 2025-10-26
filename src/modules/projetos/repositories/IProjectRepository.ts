export interface IProjectRepository {
  findByOwnerId(ownerId: string): Promise<any[]>;
  findByUserAccess(userId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  addMembers(projectId: string, memberIds: string[]): Promise<any>;
}