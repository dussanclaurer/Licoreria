import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { format } from 'date-fns';

interface SalesReportEntry {
    date: string;
    totalSales: number;
    transactionCount: number;
    paymentMethodBreakdown: {
        CASH: number;
        CARD: number;
        QR: number;
    };
}

interface TopProductEntry {
    productId: string;
    productName: string;
    totalQuantitySold: number;
    totalRevenue: number;
}

interface InventoryLogEntry {
    id: string;
    batchId: string;
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
    createdAt: string;
}

export function useSalesReport(
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month' = 'day'
) {
    return useQuery<SalesReportEntry[]>({
        queryKey: ['salesReport', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), groupBy],
        queryFn: async () => {
            const { data } = await api.get('/reports/sales', {
                params: {
                    start: format(startDate, 'yyyy-MM-dd'),
                    end: format(endDate, 'yyyy-MM-dd'),
                    groupBy,
                },
            });
            return data;
        },
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
}

export function useTopProducts(
    startDate: Date,
    endDate: Date,
    limit: number = 10
) {
    return useQuery<TopProductEntry[]>({
        queryKey: ['topProducts', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), limit],
        queryFn: async () => {
            const { data } = await api.get('/reports/top-products', {
                params: {
                    start: format(startDate, 'yyyy-MM-dd'),
                    end: format(endDate, 'yyyy-MM-dd'),
                    limit: limit.toString(),
                },
            });
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useInventoryLogs(
    startDate: Date,
    endDate: Date,
    productId?: string
) {
    return useQuery<InventoryLogEntry[]>({
        queryKey: ['inventoryLogs', format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'), productId],
        queryFn: async () => {
            const { data } = await api.get('/reports/inventory-logs', {
                params: {
                    start: format(startDate, 'yyyy-MM-dd'),
                    end: format(endDate, 'yyyy-MM-dd'),
                    ...(productId && { productId }),
                },
            });
            return data;
        },
        staleTime: 2 * 60 * 1000, // Cache for 2 minutes (more dynamic data)
    });
}
