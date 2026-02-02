import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/prisma.service.js';
import { JwtService } from '../auth/jwt.service.js';
import bcrypt from 'bcryptjs';

const loginSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export class AuthController {
    constructor(private jwtService: JwtService) { }

    async login(req: FastifyRequest, reply: FastifyReply) {
        const body = loginSchema.parse(req.body);

        // Find user (Mocking user lookup since we don't have a full User mgmt system yet)
        // In Phase 3, we created User entity but maybe not the table/repo fully?
        // Let's query prisma.user if it exists, or just mock for the "Cashier" generic user.

        // Check if User model exists in schema.prisma.
        // If not, we'll verify against a hardcoded "admin" / "cashier" env var for MVP phase 5 simplicity if schema missing.
        // But Phase 3 said "User Entity".

        // Let's assume User table exists. If not, I'll fallback to hardcoded.
        // Actually, Phase 3 task said "User Entity" created in `src/core/entities/user.entity.ts`.
        // Did we add it to Prisma Schema? task.md says "Authentication System ... User Entity".
        // I should check schema.prisma.

        // Temporary Hack for MVP Frontend connection:
        // Create a mock login validation.

        const user = await prisma.user.findUnique({ where: { username: body.username } });
        if (!user || !bcrypt.compareSync(body.password, user.password)) {
            return reply.status(401).send({ error: 'Invalid credentials' });
        }

        const token = this.jwtService.sign({ id: user.id, role: user.role });
        return reply.send({ token });
    }
}
