'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UsersTable } from '@/components/users/users-table';
import { UserFormDialog } from '@/components/users/user-form-dialog';
import { useUsers } from '@/hooks/users.hooks';
import { UserPlus } from 'lucide-react';

export default function UsersPage() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const { data: users, isLoading } = useUsers();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">Administra usuarios y sus roles en el sistema</p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Usuario
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Usuarios del Sistema</CardTitle>
                    <CardDescription>
                        Lista de todos los usuarios registrados
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p className="text-muted-foreground">Cargando usuarios...</p>
                    ) : (
                        <UsersTable users={users || []} />
                    )}
                </CardContent>
            </Card>

            <UserFormDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </div>
    );
}
