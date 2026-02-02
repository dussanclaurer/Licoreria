import { Batch } from '../entities/batch.entity.js';

export interface BatchRepository {
    save(batch: Batch): Promise<void>;
    findByProductId(productId: string): Promise<Batch[]>;
    findExpiringSoon(daysThreshold?: number): Promise<Batch[]>;
    updateStock(batchId: string, quantity: number, reason: string): Promise<void>;
}
