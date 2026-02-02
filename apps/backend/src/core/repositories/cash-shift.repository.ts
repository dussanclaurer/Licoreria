import { CashShift } from '../entities/cash-shift.entity.js';

export interface CashShiftRepository {
    save(shift: CashShift): Promise<void>;
    findById(id: string): Promise<CashShift | null>;
    findOpenShiftByUserId(userId: string): Promise<CashShift | null>;
    update(shift: CashShift): Promise<void>;
}
