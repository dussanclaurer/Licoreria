import { Product } from './product.entity.js';

export class SaleItem {
    constructor(
        public readonly product: Product,
        public readonly quantity: number,
        public readonly unitPrice: number,
    ) { }

    get subtotal(): number {
        return this.quantity * this.unitPrice;
    }
}

export class Sale {
    constructor(
        public readonly id: string,
        public readonly items: SaleItem[],
        public readonly date: Date = new Date(),
    ) { }

    get total(): number {
        return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }
}
