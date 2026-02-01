import { BatchRepository } from '../../core/repositories/batch.repository.js';
import { ProductRepository } from '../../core/repositories/product.repository.js';
import { RegisterSaleDto } from '../dtos/register-sale.dto.js';
import { Sale, SaleItem } from '../../core/entities/sale.entity.js';

export class RegisterSaleUseCase {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly batchRepository: BatchRepository,
    ) { }

    async execute(dto: RegisterSaleDto): Promise<Sale> {
        const saleItems: SaleItem[] = [];

        for (const itemDto of dto.items) {
            const product = await this.productRepository.findById(itemDto.productId);
            if (!product) {
                throw new Error(`Product with ID ${itemDto.productId} not found`);
            }

            // FEFO Logic: Get batches, filter expired (optional), sort by expiration
            let batches = await this.batchRepository.findByProductId(product.id);

            // Filter out expired batches logic could go here depending on strictness
            // batches = batches.filter(b => !b.isExpired());

            let remainingQuantity = itemDto.quantity;

            // Calculate total stock available
            const totalStock = batches.reduce((sum, b) => sum + b.currentStock, 0);
            if (totalStock < remainingQuantity) {
                throw new Error(`Insufficient stock for product ${product.name}`);
            }

            // Deduct stock from batches (Memory only here, repos persist changes typically via Transaction Manager - simplified for now)
            // Ideally this should run in a Transaction. For now we will assume the Controller usage handles transaction or we iterate update.
            // In Clean Arch, Use Case defines the transaction boundary.

            for (const batch of batches) {
                if (remainingQuantity <= 0) break;

                const deduct = Math.min(batch.currentStock, remainingQuantity);
                if (deduct > 0) {
                    // In a real scenario, we collect these operations and execute atomically
                    // Atomic update with audit log
                    await this.batchRepository.updateStock(batch.id, batch.currentStock - deduct, `Sale: ${dto.items.length > 1 ? 'Bulk ' : ''}Item`);
                    remainingQuantity -= deduct;
                }
            }

            saleItems.push(new SaleItem(product, itemDto.quantity, product.price)); // Using current price
        }

        const sale = new Sale(crypto.randomUUID(), saleItems);
        // Note: Saving the sale record itself would require a SaleRepository (omitted in first simplified plan, but needed)

        return sale;
    }
}
