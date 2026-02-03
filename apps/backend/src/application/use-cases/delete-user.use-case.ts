import { UserRepository } from '../../core/repositories/user.repository.js';

export class DeleteUserUseCase {
    constructor(private userRepo: UserRepository) { }

    async execute(userId: string) {
        // Verify user exists
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Prevent deleting the last admin
        if (user.role === 'ADMIN') {
            const adminCount = await this.userRepo.countByRole('ADMIN');
            if (adminCount <= 1) {
                throw new Error('Cannot delete the last admin user');
            }
        }

        // Delete user
        await this.userRepo.delete(userId);

        return { success: true, message: 'User deleted successfully' };
    }
}
