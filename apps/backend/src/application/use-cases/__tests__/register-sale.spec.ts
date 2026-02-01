import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterSaleUseCase } from '../register-sale.use-case.js';
import { ProductRepository } from '../../../core/repositories/product.repository.js';
import { BatchRepository } from '../../../core/repositories/batch.repository.js';
import { Product } from '../../../core/entities/product.entity.js';
import { Batch } from '../../../core/entities/batch.entity.js';
import { RegisterSaleDto, RegisterSaleItemDto } from '../../dtos/register-sale.dto.js';

describe('RegisterSaleUseCase', () => {
    let useCase: RegisterSaleUseCase;
    let productRepo: ProductRepository;
    let batchRepo: BatchRepository;

    const mockProduct = new Product('prod-1', 'Test Beer', 10);
    const mockBatch1 = new Batch('batch-1', 'prod-1', 10, new Date('2026-02-01')); // Expires sooner
    const mockBatch2 = new Batch('batch-2', 'prod-1', 20, new Date('2026-03-01')); // Expires later

    beforeEach(() => {
        productRepo = {
            findById: vi.fn(),
            findAll: vi.fn(),
            save: vi.fn(),
        };

        batchRepo = {
            findByProductId: vi.fn(),
            updateStock: vi.fn(),
            save: vi.fn(),
            findExpiringSoon: vi.fn(),
        };

        useCase = new RegisterSaleUseCase(productRepo, batchRepo);
    });

    it('should deduct stock using FEFO logic', async () => {
        vi.spyOn(productRepo, 'findById').mockResolvedValue(mockProduct);
        vi.spyOn(batchRepo, 'findByProductId').mockResolvedValue([mockBatch1, mockBatch2]);

        const dto = new RegisterSaleDto([new RegisterSaleItemDto('prod-1', 15)]);

        await useCase.execute(dto);

        // Should deduct 10 from Batch 1 (Expiring sooner)
        expect(batchRepo.updateStock).toHaveBeenCalledWith('batch-1', 0, expect.stringContaining('Sale'));
        // Should deduct 5 from Batch 2
        expect(batchRepo.updateStock).toHaveBeenCalledWith('batch-2', 15, expect.stringContaining('Sale'));
    });

    it('should throw error if insufficient stock', async () => {
        vi.spyOn(productRepo, 'findById').mockResolvedValue(mockProduct);
        vi.spyOn(batchRepo, 'findByProductId').mockResolvedValue([mockBatch1]); // Only 10 available

        const dto = new RegisterSaleDto([new RegisterSaleItemDto('prod-1', 15)]); // Requesting 15

        await expect(useCase.execute(dto)).rejects.toThrow('Insufficient stock');
    });
});
