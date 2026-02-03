import { UserRepository } from '../../core/repositories/user.repository.js';

export class UpdateUserUseCase {
    constructor(private userRepo: UserRepository) { }

    async execute(
        userId: string,
        updates: { username?: string; role?: 'ADMIN' | 'CASHIER' }
    ) {
        // Verify user exists
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // If changing username, verify it's not already in use
        if (updates.username && updates.username !== user.username) {
            const existingUser = await this.userRepo.findByUsername(updates.username);
            if (existingUser) {
                throw new Error('Username already exists');
            }
        }

        // Update user
        const updatedUser = await this.userRepo.update(userId, updates);

        // Return user without password
        return {
            id: updatedUser.id,
            username: updatedUser.username,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
    }
}
