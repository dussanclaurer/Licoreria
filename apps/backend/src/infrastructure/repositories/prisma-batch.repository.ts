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

    async findExpiringSoon(productId: string): Promise<Batch[]> {
        return this.findByProductId(productId);
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
