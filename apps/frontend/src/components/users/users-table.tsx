'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserFormDialog } from './user-form-dialog';
import { ChangePasswordDialog } from './change-password-dialog';
import { useDeleteUser } from '@/hooks/users.hooks';
import { Edit, Trash2, Key } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
    id: string;
    username: string;
    role: 'ADMIN' | 'CASHIER';
    createdAt: string;
    updatedAt: string;
}

interface UsersTableProps {
    users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [changingPasswordUser, setChangingPasswordUser] = useState<User | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    const deleteUser = useDeleteUser();

    const handleDelete = async () => {
        if (deletingUserId) {
            await deleteUser.mutateAsync(deletingUserId);
            setDeletingUserId(null);
        }
    };

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>
                                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                    {user.role === 'ADMIN' ? 'Administrador' : 'Cajero'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {format(new Date(user.createdAt), 'PP', { locale: es })}
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingUser(user)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setChangingPasswordUser(user)}
                                    >
                                        <Key className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDeletingUserId(user.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No hay usuarios registrados
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Edit User Dialog */}
            <UserFormDialog
                open={!!editingUser}
                onOpenChange={(open) => !open && setEditingUser(null)}
                user={editingUser || undefined}
            />

            {/* Change Password Dialog */}
            {changingPasswordUser && (
                <ChangePasswordDialog
                    open={!!changingPasswordUser}
                    onOpenChange={(open) => !open && setChangingPasswordUser(null)}
                    userId={changingPasswordUser.id}
                    username={changingPasswordUser.username}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingUserId} onOpenChange={(open) => !open && setDeletingUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
