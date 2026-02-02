import { Product } from '../entities/product.entity.js';

export interface ProductRepository {
    save(product: Product): Promise<void>;
    findById(id: string): Promise<Product | null>;
    findAll(): Promise<Product[]>;
    delete(id: string): Promise<void>;
    update(product: Product): Promise<void>;
    // Stats logic might be better in separate Service, but for MVP keeping in repository is fine for Hexagonal Pragmatic.
    // Actually, "Expiring Soon" belongs to BatchRepository, but "Low Stock" involves Products+Batches aggregation.
    // Let's keep findAllWithStock() or similar to simplify Frontend logic.

}
