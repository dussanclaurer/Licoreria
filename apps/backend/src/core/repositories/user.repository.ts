import { User } from '../entities/user.entity.js';

export interface UserRepository {
    create(user: { username: string; password: string; role: string }): Promise<any>;
    findById(id: string): Promise<any | null>;
    findByUsername(username: string): Promise<any | null>;
    findAll(): Promise<any[]>;
    update(id: string, data: Partial<{ username: string; password: string; role: string }>): Promise<any>;
    delete(id: string): Promise<void>;
    countByRole(role: string): Promise<number>;
}
