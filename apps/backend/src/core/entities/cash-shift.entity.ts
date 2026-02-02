export class CashShift {
    constructor(
        public readonly id: string,
        public readonly userId: string,
        public readonly initialAmount: number,
        public readonly startTime: Date,
        public readonly status: 'OPEN' | 'CLOSED',
        public readonly endTime?: Date | null,
        public readonly finalAmount?: number | null,
    ) { }
}
