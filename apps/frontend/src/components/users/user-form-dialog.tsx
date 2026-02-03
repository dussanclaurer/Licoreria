'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateUser, useUpdateUser } from '@/hooks/users.hooks';

interface UserFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: {
        id: string;
        username: string;
        role: 'ADMIN' | 'CASHIER';
    };
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'CASHIER'>(user?.role || 'CASHIER');

    const createUser = useCreateUser();
    const updateUser = useUpdateUser();

    const isEditMode = !!user;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode) {
            await updateUser.mutateAsync({
                id: user.id,
                username,
                role,
            });
        } else {
            await createUser.mutateAsync({
                username,
                password,
                role,
            });
        }

        onOpenChange(false);
        resetForm();
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setRole('CASHIER');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Nombre de Usuario</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ej. juan_perez"
                                required
                                minLength={3}
                            />
                        </div>

                        {!isEditMode && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    minLength={6}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="role">Rol</Label>
                            <Select value={role} onValueChange={(v: any) => setRole(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASHIER">Cajero</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                resetForm();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={createUser.isPending || updateUser.isPending}
                        >
                            {isEditMode ? 'Actualizar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
