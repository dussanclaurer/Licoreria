import { UserRepository } from '../../core/repositories/user.repository.js';
import bcrypt from 'bcryptjs';

export class ChangePasswordUseCase {
    constructor(private userRepo: UserRepository) { }

    async execute(userId: string, newPassword: string) {
        // Verify user exists
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Validate password length
        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        // Hash new password
        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        // Update password
        await this.userRepo.update(userId, { password: hashedPassword });

        return { success: true, message: 'Password updated successfully' };
    }
}
