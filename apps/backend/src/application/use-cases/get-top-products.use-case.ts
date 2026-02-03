import { TopProductEntry } from '../../core/types/report.types.js';
import { prisma } from '../../infrastructure/db/prisma.service.js';

export class GetTopProductsUseCase {
    async execute(
        startDate: Date,
        endDate: Date,
        limit: number = 10
    ): Promise<TopProductEntry[]> {
        const topProducts = await prisma.saleItem.groupBy({
            by: ['productId'],
            where: {
                sale: {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
            _sum: {
                quantity: true,
                subtotal: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: limit,
        });

        // Fetch product names
        const productsWithNames = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true },
                });

                return {
                    productId: item.productId,
                    productName: product?.name || 'Unknown',
                    totalQuantitySold: item._sum.quantity || 0,
                    totalRevenue: Number(item._sum.subtotal || 0),
                };
            })
        );

        return productsWithNames;
    }
}
