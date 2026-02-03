'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SalesReportChart } from '@/components/reports/sales-report-chart';
import { TopProductsTable } from '@/components/reports/top-products-table';
import { AuditLogTable } from '@/components/reports/audit-log-table';
import { useSalesReport, useTopProducts, useInventoryLogs } from '@/hooks/reports.hooks';
import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';
import { BarChart3, TrendingUp, History } from 'lucide-react';

export default function ReportsPage() {
    // Date range state
    const [startDate, setStartDate] = useState(subDays(new Date(), 7));
    const [endDate, setEndDate] = useState(new Date());
    const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

    // Fetch data
    const salesReport = useSalesReport(startDate, endDate, groupBy);
    const topProducts = useTopProducts(startDate, endDate, 10);
    const auditLogs = useInventoryLogs(startDate, endDate);

    // Quick date range presets
    const setQuickRange = (range: 'week' | 'month' | 'today') => {
        const now = new Date();
        switch (range) {
            case 'today':
                setStartDate(new Date(now.setHours(0, 0, 0, 0)));
                setEndDate(new Date());
                break;
            case 'week':
                setStartDate(subDays(now, 7));
                setEndDate(new Date());
                break;
            case 'month':
                setStartDate(startOfMonth(now));
                setEndDate(endOfMonth(now));
                break;
        }
    };

    // Calculate summary stats
    const totalSales = salesReport.data?.reduce((sum, entry) => sum + entry.totalSales, 0) || 0;
    const totalTransactions = salesReport.data?.reduce((sum, entry) => sum + entry.transactionCount, 0) || 0;
    const avgTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Reportes y Analítica</h1>
                <p className="text-muted-foreground">Análisis de ventas, productos y movimientos de inventario</p>
            </div>

            {/* Date Range Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros de Fecha</CardTitle>
                    <CardDescription>Selecciona el período a analizar</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <Label htmlFor="start-date">Fecha Inicio</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={format(startDate, 'yyyy-MM-dd')}
                                onChange={(e) => setStartDate(new Date(e.target.value))}
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <Label htmlFor="end-date">Fecha Fin</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={format(endDate, 'yyyy-MM-dd')}
                                onChange={(e) => setEndDate(new Date(e.target.value))}
                            />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <Label>Agrupar Por</Label>
                            <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="day">Día</SelectItem>
                                    <SelectItem value="week">Semana</SelectItem>
                                    <SelectItem value="month">Mes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setQuickRange('today')}>Hoy</Button>
                            <Button variant="outline" onClick={() => setQuickRange('week')}>Última Semana</Button>
                            <Button variant="outline" onClick={() => setQuickRange('month')}>Este Mes</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="ventas" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ventas">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Ventas
                    </TabsTrigger>
                    <TabsTrigger value="productos">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Top Productos
                    </TabsTrigger>
                    <TabsTrigger value="auditoria">
                        <History className="h-4 w-4 mr-2" />
                        Auditoría
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="ventas" className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Período seleccionado
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalTransactions}</div>
                                <p className="text-xs text-muted-foreground">
                                    Ventas registradas
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${avgTicket.toFixed(2)}</div>
                                <p className="text-xs text-muted-foreground">
                                    Por transacción
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <SalesReportChart data={salesReport.data || []} isLoading={salesReport.isLoading} />
                </TabsContent>

                <TabsContent value="productos">
                    <TopProductsTable data={topProducts.data || []} isLoading={topProducts.isLoading} />
                </TabsContent>

                <TabsContent value="auditoria">
                    <AuditLogTable data={auditLogs.data || []} isLoading={auditLogs.isLoading} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
