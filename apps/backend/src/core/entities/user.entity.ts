export enum UserRole {
    ADMIN = 'ADMIN',
    CASHIER = 'CASHIER',
}

export class User {
    constructor(
        public readonly id: string,
        public readonly username: string,
        public readonly role: UserRole,
        public readonly passwordHash: string,
    ) { }
}
