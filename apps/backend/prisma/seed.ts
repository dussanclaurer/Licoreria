import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    const hashedCashier = await bcrypt.hash('cashier123', 10);
    await prisma.user.upsert({
        where: { username: 'cajero' },
        update: {},
        create: {
            username: 'cajero',
            password: hashedCashier,
            role: 'CASHIER',
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
