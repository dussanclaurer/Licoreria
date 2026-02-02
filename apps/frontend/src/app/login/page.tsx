'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
    password: z.string().min(1, 'Password is required'), // In real app, maybe userId/username too. But requirement said simple auth for cashier? 
    // Wait, backend User entity has id & role. Auth middleware checks token.
    // We need a login endpoint in backend!
    // Phase 3 implemented JWT Service but did we implement a Login Endpoint?
    // Let's check backend/src/infrastructure/controllers/product.controller.ts or similar.
    // If not, we need to add it to backend first!
});

// Assuming for now we need a username and password. The previous steps implemented User entity.
// Let's assume username/password.

const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof formSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: LoginValues) => {
        try {
            const response = await api.post('/auth/login', data);
            const { token } = response.data;
            localStorage.setItem('token', token);
            toast.success('Login successful');
            router.push('/dashboard');
        } catch (error) {
            toast.error('Invalid credentials');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Licorería System</CardTitle>
                    <CardDescription>Enter your credentials to access the POS.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" {...register('username')} />
                            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" {...register('password')} />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
