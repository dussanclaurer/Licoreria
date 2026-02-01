export class RegisterSaleItemDto {
    constructor(
        public readonly productId: string,
        public readonly quantity: number,
    ) { }
}

export class RegisterSaleDto {
    constructor(
        public readonly items: RegisterSaleItemDto[],
    ) { }
}
