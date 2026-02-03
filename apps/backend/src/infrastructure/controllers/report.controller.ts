import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { GetSalesReportUseCase } from '../../application/use-cases/get-sales-report.use-case.js';
import { GetTopProductsUseCase } from '../../application/use-cases/get-top-products.use-case.js';
import { GetInventoryLogsUseCase } from '../../application/use-cases/get-inventory-logs.use-case.js';
import { PrismaSaleRepository } from '../repositories/prisma-sale.repository.js';
import { PrismaInventoryLogRepository } from '../repositories/prisma-inventory-log.repository.js';

const SalesReportQuerySchema = z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

const TopProductsQuerySchema = z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
});

const InventoryLogsQuerySchema = z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    productId: z.string().uuid().optional(),
});

export class ReportController {
    private saleRepo = new PrismaSaleRepository();
    private logRepo = new PrismaInventoryLogRepository();
    private getSalesReportUseCase = new GetSalesReportUseCase(this.saleRepo);
    private getTopProductsUseCase = new GetTopProductsUseCase();
    private getInventoryLogsUseCase = new GetInventoryLogsUseCase(this.logRepo);

    async getSalesReport(
        req: FastifyRequest<{ Querystring: z.infer<typeof SalesReportQuerySchema> }>,
        reply: FastifyReply
    ) {
        try {
            const query = SalesReportQuerySchema.parse(req.query);
            const startDate = new Date(query.start);
            const endDate = new Date(query.end);
            endDate.setHours(23, 59, 59, 999); // Include entire end date

            const report = await this.getSalesReportUseCase.execute(
                startDate,
                endDate,
                query.groupBy
            );

            return reply.send(report);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }

    async getTopProducts(
        req: FastifyRequest<{ Querystring: z.infer<typeof TopProductsQuerySchema> }>,
        reply: FastifyReply
    ) {
        try {
            const query = TopProductsQuerySchema.parse(req.query);
            const startDate = new Date(query.start);
            const endDate = new Date(query.end);
            endDate.setHours(23, 59, 59, 999);

            const report = await this.getTopProductsUseCase.execute(
                startDate,
                endDate,
                Number(query.limit)
            );

            return reply.send(report);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }

    async getInventoryLogs(
        req: FastifyRequest<{ Querystring: z.infer<typeof InventoryLogsQuerySchema> }>,
        reply: FastifyReply
    ) {
        try {
            const query = InventoryLogsQuerySchema.parse(req.query);
            const startDate = new Date(query.start);
            const endDate = new Date(query.end);
            endDate.setHours(23, 59, 59, 999);

            const logs = await this.getInventoryLogsUseCase.execute(
                startDate,
                endDate,
                query.productId
            );

            return reply.send(logs);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }
}
