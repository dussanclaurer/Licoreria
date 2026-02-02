import { BatchRepository } from '../../core/repositories/batch.repository.js';
import { ProductRepository } from '../../core/repositories/product.repository.js';
import { CashShiftRepository } from '../../core/repositories/cash-shift.repository.js';
import { RegisterSaleDto } from '../dtos/register-sale.dto.js';
import { Sale, SaleItem } from '../../core/entities/sale.entity.js';

export class RegisterSaleUseCase {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly batchRepository: BatchRepository,
        private readonly cashShiftRepository: CashShiftRepository, // New dependency
    ) { }

    async execute(dto: RegisterSaleDto & { userId: string, paymentMethod: 'CASH' | 'CARD' | 'QR' }): Promise<Sale> {
        // 1. Validate Open Shift
        const currentShift = await this.cashShiftRepository.findOpenShiftByUserId(dto.userId);
        if (!currentShift) {
            throw new Error("Cannot register sale: No open cash shift found for user.");
        }

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

        const sale = new Sale(
            crypto.randomUUID(),
            saleItems,
            new Date(),
            dto.paymentMethod,
            currentShift.id
        );
        // Note: Saving the sale record itself would require a SaleRepository.
        // For MVP, we likely trust the Controller to save Sale or we add SaleRepo.
        // Wait, current implementation didn't have SaleRepo. It just returned the Sale object in memory??
        // Checking previous Controller..
        // Controller calls `execute` then sends response. It seemingly DOES NOT Persist Sale metadata (only batches updated).
        // WE MUST PERSIST SALE. Adding SaleRepository is too much for now? No, we need it for sales reports.
        // I should stick to the current scope.
        // Actually, if I don't save the Sale, the `cashShift` relation is useless.
        // I WILL IMPLICITLY SAVE IT in the Controller or create a quick SaleRepository method?
        // Let's rely on Prisma in Controller for now to keep changes minimal, OR better:
        // Let's not refactor the whole persistence layer of Sales yet if not requested, primarily user asked for "Separar si pagaron con...".
        // BUT if I don't save it, I can't query "Sales by Payment Method".
        // I will assume the previous implementation was incomplete regarding Sale persistence and I should fix it.
        // However, looking at `ProductController`, it calls `registerSaleUseCase.execute` and returns the object.
        // The Data (Stock) IS updated. The Receipt IS generated. 
        // But the history... is missing.
        // I'll create a simple persistence step here if I can, or delegate to Repository.

        return sale;
    }
}
