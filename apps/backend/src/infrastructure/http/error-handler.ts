import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { DomainError, InsufficientStockError, ProductNotFoundError } from '../../core/errors/domain.error.js';

export const errorHandler = (error: FastifyError, req: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof ZodError) {
        return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: 'Validation Error',
            issues: error.issues,
        });
    }

    if (error instanceof InsufficientStockError) {
        return reply.status(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: error.message,
        });
    }

    if (error instanceof ProductNotFoundError) {
        return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: error.message,
        });
    }

    if (error instanceof DomainError) {
        return reply.status(400).send({
            statusCode: 400,
            error: 'Bad Request',
            message: error.message,
        });
    }

    req.log.error(error);
    return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Something went wrong',
    });
};
