import { SaleRepository } from '../../core/repositories/sale.repository.js';
import { SalesReportEntry, GroupByPeriod } from '../../core/types/report.types.js';

export class GetSalesReportUseCase {
    constructor(private saleRepo: SaleRepository) { }

    async execute(
        startDate: Date,
        endDate: Date,
        groupBy: GroupByPeriod = 'day'
    ): Promise<SalesReportEntry[]> {
        return this.saleRepo.getSalesAggregatedByDate(startDate, endDate, groupBy);
    }
}
