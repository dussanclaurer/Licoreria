export class Batch {
    constructor(
        public readonly id: string,
        public readonly productId: string,
        public readonly currentStock: number,
        public readonly expirationDate: Date,
    ) { }

    isExpired(): boolean {
        return this.expirationDate < new Date();
    }
}
