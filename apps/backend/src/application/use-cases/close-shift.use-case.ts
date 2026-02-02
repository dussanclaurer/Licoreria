import { CashShift } from '../../core/entities/cash-shift.entity.js';
import { CashShiftRepository } from '../../core/repositories/cash-shift.repository.js';

export class CloseShiftUseCase {
    constructor(private readonly repo: CashShiftRepository) { }

    async execute(userId: string, finalAmount: number): Promise<CashShift> {
        const shift = await this.repo.findOpenShiftByUserId(userId);
        if (!shift) {
            throw new Error("No open shift found for this user.");
        }

        const closedShift = new CashShift(
            shift.id,
            shift.userId,
            shift.initialAmount,
            shift.startTime,
            'CLOSED',
            new Date(),
            finalAmount
        );

        await this.repo.update(closedShift);
        return closedShift;
    }
}
