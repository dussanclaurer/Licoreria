'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, AlertTriangle, CalendarClock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Batch {
    id: string;
    product: { name: string };
    currentStock: number;
    expirationDate: string;
}

interface AlertsResponse {
    expiring: Batch[];
}

export default function DashboardPage() {
    const { data: alerts } = useQuery<AlertsResponse>({
        queryKey: ['alerts'],
        queryFn: async () => {
            const { data } = await api.get('/alerts');
            return data;
        }
    });

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Ventas Totales
                        </CardTitle>
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231.89</div>
                        <p className="text-xs text-muted-foreground">
                            (Mock Data)
                        </p>
                    </CardContent>
                </Card>
                {/* ... Other stats as placeholders ... */}
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-orange-500 h-5 w-5" />
                            Lotes por Vencer (Próximos 30 días)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Stock Actual</TableHead>
                                    <TableHead>Vence</TableHead>
                                    <TableHead>Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {alerts?.expiring.length === 0 ? (
                                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Todo en orden ✅</TableCell></TableRow>
                                ) : (
                                    alerts?.expiring.map((batch) => {
                                        const days = Math.ceil((new Date(batch.expirationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                        return (
                                            <TableRow key={batch.id}>
                                                <TableCell className="font-medium">{batch.product?.name || 'Desconocido'}</TableCell>
                                                <TableCell>{batch.currentStock}</TableCell>
                                                <TableCell>{new Date(batch.expirationDate).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={days < 7 ? "destructive" : "secondary"}>
                                                        {days < 0 ? 'Vencido' : `${days} días`}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
