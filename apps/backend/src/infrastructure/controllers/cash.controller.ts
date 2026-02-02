import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PrismaCashShiftRepository } from '../repositories/prisma-cash-shift.repository.js';
import { OpenShiftUseCase } from '../../application/use-cases/open-shift.use-case.js';
import { CloseShiftUseCase } from '../../application/use-cases/close-shift.use-case.js';

const OpenShiftSchema = z.object({
    userId: z.string().uuid(),
    initialAmount: z.number().nonnegative(),
});

const CloseShiftSchema = z.object({
    userId: z.string().uuid(),
    finalAmount: z.number().nonnegative(),
});

export class CashController {
    private repo = new PrismaCashShiftRepository();
    private openUseCase = new OpenShiftUseCase(this.repo);
    private closeUseCase = new CloseShiftUseCase(this.repo);

    async openShift(req: FastifyRequest<{ Body: z.infer<typeof OpenShiftSchema> }>, reply: FastifyReply) {
        try {
            console.log("Opening Shift Request:", req.body);
            const shift = await this.openUseCase.execute(req.body.userId, req.body.initialAmount);
            return reply.status(201).send(shift);
        } catch (error: any) {
            console.error("Open Shift Error:", error);
            return reply.status(400).send({ error: error.message });
        }
    }

    async closeShift(req: FastifyRequest<{ Body: z.infer<typeof CloseShiftSchema> }>, reply: FastifyReply) {
        try {
            const shift = await this.closeUseCase.execute(req.body.userId, req.body.finalAmount);
            return reply.status(200).send(shift);
        } catch (error: any) {
            return reply.status(400).send({ error: error.message });
        }
    }

    async checkStatus(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
        const shift = await this.repo.findOpenShiftByUserId(req.params.userId);
        return reply.send({ isOpen: !!shift, shift });
    }
}
