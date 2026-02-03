import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case.js';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case.js';
import { ChangePasswordUseCase } from '../../application/use-cases/change-password.use-case.js';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case.js';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case.js';
import { PrismaUserRepository } from '../repositories/prisma-user.repository.js';

const CreateUserSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    role: z.enum(['ADMIN', 'CASHIER']),
});

const UpdateUserSchema = z.object({
    username: z.string().min(3).optional(),
    role: z.enum(['ADMIN', 'CASHIER']).optional(),
});

const ChangePasswordSchema = z.object({
    newPassword: z.string().min(6),
});

export class UserController {
    private userRepo = new PrismaUserRepository();
    private createUserUseCase = new CreateUserUseCase(this.userRepo);
    private updateUserUseCase = new UpdateUserUseCase(this.userRepo);
    private changePasswordUseCase = new ChangePasswordUseCase(this.userRepo);
    private listUsersUseCase = new ListUsersUseCase(this.userRepo);
    private deleteUserUseCase = new DeleteUserUseCase(this.userRepo);

    async createUser(
        req: FastifyRequest<{ Body: z.infer<typeof CreateUserSchema> }>,
        reply: FastifyReply
    ) {
        try {
            const body = CreateUserSchema.parse(req.body);
            const user = await this.createUserUseCase.execute(
                body.username,
                body.password,
                body.role
            );
            return reply.status(201).send(user);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }

    async listUsers(req: FastifyRequest, reply: FastifyReply) {
        try {
            const users = await this.listUsersUseCase.execute();
            return reply.send(users);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }

    async getUser(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        try {
            const user = await this.userRepo.findById(req.params.id);
            if (!user) {
                return reply.status(404).send({ error: 'User not found' });
            }
            // Return without password
            const { password, ...userWithoutPassword } = user;
            return reply.send(userWithoutPassword);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }

    async updateUser(
        req: FastifyRequest<{
            Params: { id: string };
            Body: z.infer<typeof UpdateUserSchema>;
        }>,
        reply: FastifyReply
    ) {
        try {
            const body = UpdateUserSchema.parse(req.body);
            const user = await this.updateUserUseCase.execute(req.params.id, body);
            return reply.send(user);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }

    async changePassword(
        req: FastifyRequest<{
            Params: { id: string };
            Body: z.infer<typeof ChangePasswordSchema>;
        }>,
        reply: FastifyReply
    ) {
        try {
            const body = ChangePasswordSchema.parse(req.body);
            const result = await this.changePasswordUseCase.execute(
                req.params.id,
                body.newPassword
            );
            return reply.send(result);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }

    async deleteUser(
        req: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ) {
        try {
            const result = await this.deleteUserUseCase.execute(req.params.id);
            return reply.send(result);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }
}
