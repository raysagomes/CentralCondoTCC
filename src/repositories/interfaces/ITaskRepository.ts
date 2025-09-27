export interface ITaskRepository {
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
  findPendingByOwnerId(ownerId: string): Promise<any[]>;
}