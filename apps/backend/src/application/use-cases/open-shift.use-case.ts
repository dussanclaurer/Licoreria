import { CashShift } from '../../core/entities/cash-shift.entity.js';
import { CashShiftRepository } from '../../core/repositories/cash-shift.repository.js';

export class OpenShiftUseCase {
    constructor(private readonly repo: CashShiftRepository) { }

    async execute(userId: string, initialAmount: number): Promise<CashShift> {
        const existing = await this.repo.findOpenShiftByUserId(userId);
        if (existing) {
            throw new Error("User already has an open shift.");
        }

        const shift = new CashShift(
            crypto.randomUUID(),
            userId,
            initialAmount,
            new Date(),
            'OPEN'
        );

        await this.repo.save(shift);
        return shift;
    }
}
