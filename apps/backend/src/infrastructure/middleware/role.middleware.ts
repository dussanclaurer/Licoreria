import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtService } from '../auth/jwt.service.js';

export function createRoleMiddleware(allowedRoles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const token = request.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return reply.status(401).send({ error: 'No token provided' });
        }

        const jwtService = new JwtService(process.env.JWT_SECRET || 'secret');
        const payload = jwtService.verify(token);

        if (!payload) {
            return reply.status(401).send({ error: 'Invalid token' });
        }

        // Check if user role is allowed
        if (!allowedRoles.includes(payload.role)) {
            return reply.status(403).send({ error: 'Insufficient permissions' });
        }

        // Attach user to request for use in handlers
        (request as any).user = payload;
    };
}
