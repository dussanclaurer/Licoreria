export interface SalesReportEntry {
    date: string; // ISO date string
    totalSales: number;
    transactionCount: number;
    paymentMethodBreakdown: {
        CASH: number;
        CARD: number;
        QR: number;
    };
}

export interface TopProductEntry {
    productId: string;
    productName: string;
    totalQuantitySold: number;
    totalRevenue: number;
}

export interface InventoryLogEntry {
    id: string;
    batchId: string;
    productId: string;
    productName: string;
    quantity: number; // Negative for sales, positive for restock
    reason: string;
    createdAt: Date;
}

export type GroupByPeriod = 'day' | 'week' | 'month';
