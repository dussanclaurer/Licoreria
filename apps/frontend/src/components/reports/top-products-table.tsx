'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TopProductsTableProps {
    data: Array<{
        productId: string;
        productName: string;
        totalQuantitySold: number;
        totalRevenue: number;
    }>;
    isLoading: boolean;
}

export function TopProductsTable({ data, isLoading }: TopProductsTableProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Productos Más Vendidos</CardTitle>
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
                <CardTitle>Productos Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-right">Unidades Vendidas</TableHead>
                            <TableHead className="text-right">Ingresos</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((product, index) => (
                            <TableRow key={product.productId}>
                                <TableCell>
                                    <Badge variant={index === 0 ? 'default' : 'secondary'}>
                                        {index + 1}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-medium">{product.productName}</TableCell>
                                <TableCell className="text-right">{product.totalQuantitySold}</TableCell>
                                <TableCell className="text-right font-semibold">
                                    ${product.totalRevenue.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    No hay datos disponibles para el período seleccionado
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
