import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface User {
    id: string;
    username: string;
    role: 'ADMIN' | 'CASHIER';
    createdAt: string;
    updatedAt: string;
}

export function useUsers() {
    return useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        },
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userData: { username: string; password: string; role: 'ADMIN' | 'CASHIER' }) => {
            const { data } = await api.post('/users', userData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuario creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Error al crear usuario');
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updates }: { id: string; username?: string; role?: 'ADMIN' | 'CASHIER' }) => {
            const { data } = await api.put(`/users/${id}`, updates);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuario actualizado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Error al actualizar usuario');
        },
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
            const { data } = await api.put(`/users/${id}/password`, { newPassword });
            return data;
        },
        onSuccess: () => {
            toast.success('Contraseña cambiada exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Error al cambiar contraseña');
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await api.delete(`/users/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuario eliminado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Error al eliminar usuario');
        },
    });
}
