import { InventoryLogRepository } from '../../core/repositories/inventory-log.repository.js';
import { InventoryLogEntry } from '../../core/types/report.types.js';
import { prisma } from '../db/prisma.service.js';

export class PrismaInventoryLogRepository implements InventoryLogRepository {
    async findByDateRange(
        startDate: Date,
        endDate: Date,
        productId?: string
    ): Promise<InventoryLogEntry[]> {
        const logs = await prisma.inventoryLog.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                ...(productId && {
                    batch: {
                        productId: productId,
                    },
                }),
            },
            include: {
                batch: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return logs.map((log) => ({
            id: log.id,
            batchId: log.batchId,
            productId: log.batch.product.id,
            productName: log.batch.product.name,
            quantity: log.quantity,
            reason: log.reason,
            createdAt: log.createdAt,
        }));
    }

    async create(log: {
        batchId: string;
        quantity: number;
        reason: string;
    }): Promise<void> {
        await prisma.inventoryLog.create({
            data: {
                batchId: log.batchId,
                quantity: log.quantity,
                reason: log.reason,
            },
        });
    }
}
