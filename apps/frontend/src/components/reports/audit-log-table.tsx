'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditLogTableProps {
    data: Array<{
        id: string;
        productName: string;
        quantity: number;
        reason: string;
        createdAt: string;
    }>;
    isLoading: boolean;
}

export function AuditLogTable({ data, isLoading }: AuditLogTableProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Auditoría de Movimientos</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Cargando datos...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Auditoría de Movimientos</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha y Hora</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Razón</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell className="font-mono text-sm">
                                    {format(new Date(log.createdAt), 'PPp', { locale: es })}
                                </TableCell>
                                <TableCell className="font-medium">{log.productName}</TableCell>
                                <TableCell>
                                    <Badge variant={log.quantity < 0 ? 'destructive' : 'default'}>
                                        {log.quantity > 0 ? '+' : ''}{log.quantity}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{log.reason}</TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No hay movimientos registrados para el período seleccionado
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
