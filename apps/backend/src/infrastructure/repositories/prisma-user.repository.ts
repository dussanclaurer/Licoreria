import { UserRepository } from '../../core/repositories/user.repository.js';
import { prisma } from '../db/prisma.service.js';

export class PrismaUserRepository implements UserRepository {
    async create(userData: { username: string; password: string; role: string }): Promise<any> {
        const user = await prisma.user.create({
            data: userData,
        });
        return user;
    }

    async findById(id: string): Promise<any | null> {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        return user;
    }

    async findByUsername(username: string): Promise<any | null> {
        const user = await prisma.user.findUnique({
            where: { username },
        });
        return user;
    }

    async findAll(): Promise<any[]> {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return users;
    }

    async update(
        id: string,
        data: Partial<{ username: string; password: string; role: string }>
    ): Promise<any> {
        const user = await prisma.user.update({
            where: { id },
            data,
        });
        return user;
    }

    async delete(id: string): Promise<void> {
        await prisma.user.delete({
            where: { id },
        });
    }

    async countByRole(role: string): Promise<number> {
        return prisma.user.count({
            where: { role },
        });
    }
}
