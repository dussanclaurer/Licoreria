import { CashShift } from '../../core/entities/cash-shift.entity.js';
import { CashShiftRepository } from '../../core/repositories/cash-shift.repository.js';
import { prisma } from '../db/prisma.service.js';

export class PrismaCashShiftRepository implements CashShiftRepository {
    async save(shift: CashShift): Promise<void> {
        await prisma.cashShift.create({
            data: {
                id: shift.id,
                userId: shift.userId,
                initialAmount: shift.initialAmount,
                startTime: shift.startTime,
                status: shift.status,
            },
        });
    }

    async findById(id: string): Promise<CashShift | null> {
        const data = await prisma.cashShift.findUnique({ where: { id } });
        if (!data) return null;
        return new CashShift(
            data.id,
            data.userId,
            data.initialAmount.toNumber(),
            data.startTime,
            data.status as 'OPEN' | 'CLOSED',
            data.endTime,
            data.finalAmount?.toNumber()
        );
    }

    async findOpenShiftByUserId(userId: string): Promise<CashShift | null> {
        const data = await prisma.cashShift.findFirst({
            where: { userId, status: 'OPEN' },
        });
        if (!data) return null;
        return new CashShift(
            data.id,
            data.userId,
            data.initialAmount.toNumber(),
            data.startTime,
            data.status as 'OPEN' | 'CLOSED',
            data.endTime,
            data.finalAmount?.toNumber()
        );
    }

    async update(shift: CashShift): Promise<void> {
        await prisma.cashShift.update({
            where: { id: shift.id },
            data: {
                status: shift.status,
                endTime: shift.endTime,
                finalAmount: shift.finalAmount,
            },
        });
    }
}
