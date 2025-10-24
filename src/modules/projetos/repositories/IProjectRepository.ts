export interface IProjectRepository {
  findByOwnerId(ownerId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  findById(id: string): Promise<any | null>;
}