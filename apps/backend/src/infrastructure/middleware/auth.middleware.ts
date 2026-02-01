import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtService } from '../auth/jwt.service.js';

const jwtService = new JwtService(process.env.JWT_SECRET || 'secret-fallback'); // TODO: Env var

declare module 'fastify' {
    interface FastifyRequest {
        user?: { id: string; role: string };
    }
}

export const authenticate = async (req: FastifyRequest, reply: FastifyReply) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return reply.status(401).send({ error: 'Unauthorized: Missing token' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    const payload = jwtService.verify(token);

    if (!payload) {
        return reply.status(401).send({ error: 'Unauthorized: Invalid token' });
    }

    req.user = payload;
};

export const authorize = (roles: string[]) => {
    return async (req: FastifyRequest, reply: FastifyReply) => {
        if (!req.user) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return reply.status(403).send({ error: 'Forbidden: Insufficient permissions' });
        }
    };
};
