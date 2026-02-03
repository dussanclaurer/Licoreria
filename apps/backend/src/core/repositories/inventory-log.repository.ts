import { InventoryLogEntry } from '../types/report.types.js';

export interface InventoryLogRepository {
    findByDateRange(
        startDate: Date,
        endDate: Date,
        productId?: string
    ): Promise<InventoryLogEntry[]>;

    create(log: {
        batchId: string;
        quantity: number;
        reason: string;
    }): Promise<void>;
}
