import { SaleRepository } from '../../core/repositories/sale.repository.js';
import { SalesReportEntry, GroupByPeriod } from '../../core/types/report.types.js';
import { prisma } from '../db/prisma.service.js';

export class PrismaSaleRepository implements SaleRepository {
    async getSalesAggregatedByDate(
        startDate: Date,
        endDate: Date,
        groupBy: GroupByPeriod
    ): Promise<SalesReportEntry[]> {
        const sales = await prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                total: true,
                paymentMethod: true,
                createdAt: true,
            },
        });

        // Group sales by date period
        const grouped = new Map<string, SalesReportEntry>();

        sales.forEach((sale) => {
            const dateKey = this.getDateKey(sale.createdAt, groupBy);

            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, {
                    date: dateKey,
                    totalSales: 0,
                    transactionCount: 0,
                    paymentMethodBreakdown: {
                        CASH: 0,
                        CARD: 0,
                        QR: 0,
                    },
                });
            }

            const entry = grouped.get(dateKey)!;
            entry.totalSales += Number(sale.total);
            entry.transactionCount += 1;
            entry.paymentMethodBreakdown[sale.paymentMethod] += Number(sale.total);
        });

        return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
    }

    private getDateKey(date: Date, groupBy: GroupByPeriod): string {
        const d = new Date(date);

        switch (groupBy) {
            case 'day':
                return d.toISOString().split('T')[0]; // YYYY-MM-DD
            case 'week':
                // Get Monday of the week
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(d.setDate(diff));
                return monday.toISOString().split('T')[0];
            case 'month':
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        }
    }
}
