export interface IEventRepository {
  findByOwnerId(ownerId: string): Promise<any[]>;
  create(data: any): Promise<any>;
  findRecentByOwnerId(ownerId: string): Promise<any[]>;
}