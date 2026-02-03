import { UserRepository } from '../../core/repositories/user.repository.js';

export class ListUsersUseCase {
    constructor(private userRepo: UserRepository) { }

    async execute() {
        const users = await this.userRepo.findAll();

        // Return users without passwords
        return users.map((user) => ({
            id: user.id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));
    }
}
