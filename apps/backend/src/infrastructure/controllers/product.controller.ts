import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PrismaProductRepository } from '../repositories/prisma-product.repository.js';
import { PrismaBatchRepository } from '../repositories/prisma-batch.repository.js';
import { RegisterSaleUseCase } from '../../application/use-cases/register-sale.use-case.js';
import { Product } from '../../core/entities/product.entity.js';
import { Batch } from '../../core/entities/batch.entity.js';
import { PrismaCashShiftRepository } from '../repositories/prisma-cash-shift.repository.js';
import { prisma } from '../db/prisma.service.js';

// Schemas
const CreateProductSchema = z.object({
    name: z.string().min(3),
    price: z.number().positive(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    minStock: z.number().int().nonnegative().default(10),
});

const UpdateProductSchema = CreateProductSchema.partial();

const AddBatchSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
    expirationDate: z.string().datetime(),
});

const RegisterSaleSchema = z.object({
    items: z.array(z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
    })),
    userId: z.string().uuid(), // Ideally from Auth Token, but for simplicity passed in body or extracted
    paymentMethod: z.enum(['CASH', 'CARD', 'QR']).default('CASH'),
});

export class ProductController {
    private productRepo = new PrismaProductRepository();
    private batchRepo = new PrismaBatchRepository();
    private cashShiftRepo = new PrismaCashShiftRepository();
    private registerSaleUseCase = new RegisterSaleUseCase(this.productRepo, this.batchRepo, this.cashShiftRepo);

    async createProduct(req: FastifyRequest<{ Body: z.infer<typeof CreateProductSchema> }>, reply: FastifyReply) {
        const { name, price, description, imageUrl, minStock } = req.body;
        const product = new Product(crypto.randomUUID(), name, price, description, imageUrl, minStock);
        await this.productRepo.save(product);
        return reply.status(201).send(product);
    }

    async updateProduct(req: FastifyRequest<{ Params: { id: string }, Body: z.infer<typeof UpdateProductSchema> }>, reply: FastifyReply) {
        const { id } = req.params;
        const existing = await this.productRepo.findById(id);
        if (!existing) return reply.status(404).send({ error: 'Product not found' });

        const { name, price, description, imageUrl, minStock } = req.body;
        const updated = new Product(
            id,
            name ?? existing.name,
            price ?? existing.price,
            description ?? existing.description,
            imageUrl ?? existing.imageUrl,
            minStock ?? existing.minStock
        );
        await this.productRepo.update(updated);
        return reply.send(updated);
    }

    async deleteProduct(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
        const { id } = req.params;
        await this.productRepo.delete(id);
        return reply.status(204).send();
    }

    async listProducts(req: FastifyRequest, reply: FastifyReply) {
        const products = await this.productRepo.findAll();
        return reply.send(products);
    }

    async addBatch(req: FastifyRequest<{ Body: z.infer<typeof AddBatchSchema> }>, reply: FastifyReply) {
        const { productId, quantity, expirationDate } = req.body;
        const batch = new Batch(crypto.randomUUID(), productId, quantity, new Date(expirationDate));
        await this.batchRepo.save(batch);
        return reply.status(201).send(batch);
    }

    async registerSale(req: FastifyRequest<{ Body: z.infer<typeof RegisterSaleSchema> }>, reply: FastifyReply) {
        try {
            // Use Case executes logic (Stock Deduction + Shift Validation) and returns Sale Entity
            const sale = await this.registerSaleUseCase.execute({
                items: req.body.items,
                userId: req.body.userId, // In a real app, use req.user.id
                paymentMethod: req.body.paymentMethod,
            });

            // Persist Sale (Pragmatic: Direct Prisma here instead of full Repository to save time)
            await prisma.sale.create({
                data: {
                    id: sale.id,
                    total: sale.total,
                    paymentMethod: sale.paymentMethod,
                    cashShiftId: sale.cashShiftId,
                    items: {
                        create: sale.items.map(i => ({
                            productId: i.product.id,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            subtotal: i.subtotal
                        }))
                    }
                }
            });

            return reply.status(201).send(sale);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }
    async getAlerts(req: FastifyRequest, reply: FastifyReply) {
        // Expiring Soon (30 days default)
        const expiringBatches = await this.batchRepo.findExpiringSoon(30);
        return reply.send({
            expiring: expiringBatches,
        });
    }
}
