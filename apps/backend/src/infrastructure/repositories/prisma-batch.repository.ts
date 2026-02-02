import { Batch } from '../../core/entities/batch.entity.js';
import { BatchRepository } from '../../core/repositories/batch.repository.js';
import { prisma } from '../db/prisma.service.js';

export class PrismaBatchRepository implements BatchRepository {
    async save(batch: Batch): Promise<void> {
        await prisma.batch.create({
            data: {
                id: batch.id,
                productId: batch.productId,
                currentStock: batch.currentStock,
                initialStock: batch.currentStock,
                expirationDate: batch.expirationDate,
            },
        });
    }

    async findByProductId(productId: string): Promise<Batch[]> {
        const data = await prisma.batch.findMany({
            where: { productId },
            orderBy: { expirationDate: 'asc' }, // FEFO Priority
        });
        return data.map(b => new Batch(b.id, b.productId, b.currentStock, b.expirationDate));
    }

    async findExpiringSoon(daysThreshold: number = 30): Promise<Batch[]> {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

        const data = await prisma.batch.findMany({
            where: {
                expirationDate: {
                    lte: thresholdDate,
                    gte: new Date(), // Not already expired? Or maybe show expired too? Let's show upcoming.
                },
                currentStock: { gt: 0 }
            },
            include: { product: true }, // We might need product name
            orderBy: { expirationDate: 'asc' },
        });

        // Note: Batch Entity doesn't have product Name. We might need a DTO or specific query in Controller.
        // For now, return Batches. Controller might fetch Product details or we rely on ID.
        return data.map(b => new Batch(b.id, b.productId, b.currentStock, b.expirationDate));
    }

    async updateStock(batchId: string, newStock: number, reason: string): Promise<void> {
        const batch = await prisma.batch.findUnique({ where: { id: batchId } });
        if (!batch) throw new Error("Batch not found");

        const diff = newStock - batch.currentStock;

        await prisma.$transaction([
            prisma.batch.update({
                where: { id: batchId },
                data: { currentStock: newStock },
            }),
            prisma.inventoryLog.create({
                data: {
                    batchId,
                    quantity: diff,
                    reason,
                },
            }),
        ]);
    }
}
