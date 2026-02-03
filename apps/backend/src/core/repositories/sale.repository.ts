import { SalesReportEntry, GroupByPeriod } from '../types/report.types.js';

export interface SaleRepository {
    getSalesAggregatedByDate(
        startDate: Date,
        endDate: Date,
        groupBy: GroupByPeriod
    ): Promise<SalesReportEntry[]>;
}
