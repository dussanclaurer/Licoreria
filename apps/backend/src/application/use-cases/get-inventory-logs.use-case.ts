import { InventoryLogRepository } from '../../core/repositories/inventory-log.repository.js';
import { InventoryLogEntry } from '../../core/types/report.types.js';

export class GetInventoryLogsUseCase {
    constructor(private logRepo: InventoryLogRepository) { }

    async execute(
        startDate: Date,
        endDate: Date,
        productId?: string
    ): Promise<InventoryLogEntry[]> {
        return this.logRepo.findByDateRange(startDate, endDate, productId);
    }
}
