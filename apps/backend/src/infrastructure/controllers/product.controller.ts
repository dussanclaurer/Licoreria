import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PrismaProductRepository } from '../repositories/prisma-product.repository.js';
import { PrismaBatchRepository } from '../repositories/prisma-batch.repository.js';
import { RegisterSaleUseCase } from '../../application/use-cases/register-sale.use-case.js';
import { Product } from '../../core/entities/product.entity.js';
import { Batch } from '../../core/entities/batch.entity.js';

// Schemas
const CreateProductSchema = z.object({
    name: z.string().min(3),
    price: z.number().positive(),
    description: z.string().optional(),
});

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
});

export async function productRoutes(server: FastifyInstance) {
    const productRepo = new PrismaProductRepository();
    const batchRepo = new PrismaBatchRepository();
    const registerSaleUseCase = new RegisterSaleUseCase(productRepo, batchRepo);

    server.post('/products', {
        schema: { body: CreateProductSchema }
    }, async (req: FastifyRequest<{ Body: z.infer<typeof CreateProductSchema> }>, reply: FastifyReply) => {
        const { name, price, description } = req.body;
        const product = new Product(crypto.randomUUID(), name, price, description);
        await productRepo.save(product);
        return reply.status(201).send(product);
    });

    server.get('/products', async (req, reply) => {
        const products = await productRepo.findAll();
        return reply.send(products);
    });

    server.post('/batches', {
        schema: { body: AddBatchSchema }
    }, async (req: FastifyRequest<{ Body: z.infer<typeof AddBatchSchema> }>, reply: FastifyReply) => {
        const { productId, quantity, expirationDate } = req.body;
        const batch = new Batch(crypto.randomUUID(), productId, quantity, new Date(expirationDate));
        await batchRepo.save(batch);
        return reply.status(201).send(batch);
    });

    server.post('/sales', {
        schema: { body: RegisterSaleSchema }
    }, async (req: FastifyRequest<{ Body: z.infer<typeof RegisterSaleSchema> }>, reply: FastifyReply) => {
        try {
            const sale = await registerSaleUseCase.execute(req.body);
            // In a real app we would save the sale to DB here via saleRepo.save(sale)
            return reply.status(201).send(sale);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    });
}
