import { UserRepository } from '../../core/repositories/user.repository.js';
import bcrypt from 'bcryptjs';

export class CreateUserUseCase {
    constructor(private userRepo: UserRepository) { }

    async execute(username: string, password: string, role: 'ADMIN' | 'CASHIER') {
        // Validate username is unique
        const existingUser = await this.userRepo.findByUsername(username);
        if (existingUser) {
            throw new Error('Username already exists');
        }

        // Validate password length
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Create user
        const user = await this.userRepo.create({
            username,
            password: hashedPassword,
            role,
        });

        // Return user without password
        return {
            id: user.id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
