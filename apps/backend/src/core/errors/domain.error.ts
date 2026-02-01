export class DomainError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DomainError';
    }
}

export class InsufficientStockError extends DomainError {
    constructor(productName: string) {
        super(`Insufficient stock for product ${productName}`);
        this.name = 'InsufficientStockError';
    }
}

export class ProductNotFoundError extends DomainError {
    constructor(id: string) {
        super(`Product with ID ${id} not found`);
        this.name = 'ProductNotFoundError';
    }
}
