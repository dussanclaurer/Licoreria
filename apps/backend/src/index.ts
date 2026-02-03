import Fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

const server = Fastify({
    logger: true
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(cors, {
    origin: '*' // TODO: Configure for production
});

// Assuming these imports and instantiations are now required based on the provided code edit
import { ProductController } from './infrastructure/controllers/product.controller.js';
import { JwtService } from './infrastructure/auth/jwt.service.js';
import { AuthController } from './infrastructure/controllers/auth.controller.js';

const productController = new ProductController(); // Assuming ProductController needs to be instantiated

// Products & Batches
server.register(async (instance) => {
    instance.post('/products', productController.createProduct.bind(productController));
    instance.get('/products', productController.listProducts.bind(productController));
    instance.get('/alerts', productController.getAlerts.bind(productController));
    instance.put('/products/:id', productController.updateProduct.bind(productController));
    instance.delete('/products/:id', productController.deleteProduct.bind(productController));

    instance.post('/batches', productController.addBatch.bind(productController));
    instance.post('/sales', productController.registerSale.bind(productController));
});

// Auth
const jwtService = new JwtService(process.env.JWT_SECRET || 'secret');
const authController = new AuthController(jwtService);
server.post('/auth/login', authController.login.bind(authController));

server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000', 10);
        await server.listen({ port, host: '0.0.0.0' });

        // Graceful shutdown
        const signals = ['SIGINT', 'SIGTERM'];
        signals.forEach((signal) => {
            process.on(signal, async () => {
                server.log.info(`Received ${signal}, shutting down...`);
                await server.close();
                process.exit(0);
            });
        });

    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

import { CashController } from './infrastructure/controllers/cash.controller.js';
import { ReportController } from './infrastructure/controllers/report.controller.js';
import { UserController } from './infrastructure/controllers/user.controller.js';
import { createRoleMiddleware } from './infrastructure/middleware/role.middleware.js';

const cashController = new CashController();
const reportController = new ReportController();
const userController = new UserController();

// Cash Management
server.register(async (instance) => {
    instance.post('/cash/open', cashController.openShift.bind(cashController));
    instance.post('/cash/close', cashController.closeShift.bind(cashController));
    instance.get('/cash/status/:userId', cashController.checkStatus.bind(cashController));
});

// Reports
server.register(async (instance) => {
    instance.get('/reports/sales', reportController.getSalesReport.bind(reportController));
    instance.get('/reports/top-products', reportController.getTopProducts.bind(reportController));
    instance.get('/reports/inventory-logs', reportController.getInventoryLogs.bind(reportController));
});

// User Management (ADMIN only)
server.register(async (instance) => {
    // Apply role middleware to all routes in this scope
    instance.addHook('onRequest', createRoleMiddleware(['ADMIN']));

    instance.post('/users', userController.createUser.bind(userController));
    instance.get('/users', userController.listUsers.bind(userController));
    instance.get('/users/:id', userController.getUser.bind(userController));
    instance.put('/users/:id', userController.updateUser.bind(userController));
    instance.put('/users/:id/password', userController.changePassword.bind(userController));
    instance.delete('/users/:id', userController.deleteUser.bind(userController));
});

start();
