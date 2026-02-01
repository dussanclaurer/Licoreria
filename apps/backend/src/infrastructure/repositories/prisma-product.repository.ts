import { Product } from '../../core/entities/product.entity.js';
import { ProductRepository } from '../../core/repositories/product.repository.js';
import { prisma } from '../db/prisma.service.js';

export class PrismaProductRepository implements ProductRepository {
    async save(product: Product): Promise<void> {
        await prisma.product.create({
            data: {
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description,
            },
        });
    }

    async findById(id: string): Promise<Product | null> {
        const data = await prisma.product.findUnique({ where: { id } });
        if (!data) return null;
        return new Product(data.id, data.name, data.price.toNumber(), data.description);
    }

    async findAll(): Promise<Product[]> {
        const data = await prisma.product.findMany();
        return data.map(p => new Product(p.id, p.name, p.price.toNumber(), p.description));
    }
}
