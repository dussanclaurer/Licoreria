'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { useShiftStore } from '@/lib/shift-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Plus, Minus, Trash2, Printer, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

// Define Product type based on backend
interface Product {
    id: string;
    name: string;
    price: string; // Decimal comes as string from JSON often
    description?: string;
}

export default function POSPage() {
    const [search, setSearch] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'QR'>('CASH');
    const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();
    const { isOpen, checkStatus, openShift } = useShiftStore();

    // Shift State
    const [initialAmount, setInitialAmount] = useState('100');
    // Receipt State
    const [lastSale, setLastSale] = useState<any>(null);

    // Helper to get User ID
    const getUserId = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            // Backend uses 'id' not 'userId' in JWT payload
            return payload.id || null;
        } catch (e) {
            console.error("Token decode error:", e);
            return null;
        }
    };

    // Fetch User ID from Token
    useEffect(() => {
        const uid = getUserId();
        if (uid) {
            checkStatus(uid);
        }
    }, [checkStatus]);

    const { data: products, isLoading } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await api.get('/products');
            return data;
        },
    });

    // ... (saleMutation) ...

    const saleMutation = useMutation({
        mutationFn: async () => {
            const uid = getUserId();
            if (!uid) throw new Error("Usuario no identificado");

            const payload = {
                items: items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                })),
                userId: uid,
                paymentMethod: paymentMethod,
            };
            const { data } = await api.post('/sales', payload);
            return data;
        },
        onSuccess: (data) => {
            toast.success('Venta registrada correctamente');
            clearCart();
            setLastSale(data);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Error al registrar venta');
        },
    });

    const handleOpenShift = async () => {
        const uid = getUserId();
        if (!uid) {
            toast.error("Error: No se pudo identificar al usuario. Inicia sesión nuevamente.");
            return;
        }

        console.log("Opening shift for user:", uid, "Amount:", initialAmount);

        try {
            await openShift(uid, parseFloat(initialAmount));
            toast.success("Caja abierta correctamente");
        } catch (error: any) {
            console.error("Open Shift Error in Component:", error);
            // Error already handled in store? store doesn't throw? store awaits api.post.
            // shift-store doesn't try-catch, so it bubbles up.
            toast.error("Error al abrir caja. Verifica si ya tienes un turno abierto.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredProducts = products?.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddToCart = (product: Product) => {
        addItem({
            productId: product.id,
            name: product.name,
            price: parseFloat(product.price),
            quantity: 1,
        });
        toast.success(`${product.name} agregado al carrito`);
    };

    // Receipt Component
    if (lastSale) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-black z-50 fixed inset-0">
                <div className="w-[300px] border p-4 print:border-none print:w-full">
                    <div className="text-center mb-4">
                        <h1 className="text-xl font-bold">LICORERIA DUSSAN</h1>
                        <p className="text-sm">Ticket #{lastSale.id.slice(0, 8)}</p>
                        <p className="text-sm">{new Date().toLocaleString()}</p>
                    </div>
                    <div className="border-b border-dashed my-2"></div>
                    <div className="flex justify-between font-bold text-lg">
                        <span>TOTAL</span>
                        <span>${parseFloat(lastSale.total).toFixed(2)}</span>
                    </div>
                    <div className="text-center mt-4 text-sm">
                        Pago: {lastSale.paymentMethod}
                    </div>
                    <div className="border-b border-dashed my-2"></div>
                    <div className="text-center text-sm">¡Gracias por su compra!</div>

                    <div className="mt-8 flex gap-2 print:hidden justify-center">
                        <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
                        <Button variant="outline" onClick={() => setLastSale(null)}>Cerrar</Button>
                    </div>
                </div>
            </div>
        );
    }

    // Block if Shift Closed
    if (!isOpen) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
                <Lock className="h-16 w-16 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Caja Cerrada</h2>
                <p className="text-muted-foreground">Debes abrir caja para realizar ventas.</p>
                <div className="flex items-center gap-2">
                    <Label>Fondo Inicial:</Label>
                    <Input type="number" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} className="w-32" />
                </div>
                <Button onClick={handleOpenShift}>Abrir Caja</Button>
            </div>
        )
    }

    return (
        <>
            {/* Mobile: Tabs */}
            <div className="lg:hidden">
                <Tabs defaultValue="products" className="h-[calc(100vh-120px)]">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="products">Productos</TabsTrigger>
                        <TabsTrigger value="cart" className="relative">
                            Carrito
                            {items.length > 0 && (
                                <span className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs">
                                    {items.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="h-full overflow-hidden">
                        <div className="flex flex-col gap-4 h-full">
                            <Input
                                placeholder="Buscar productos..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto">
                                {isLoading ? (
                                    <p className="col-span-full text-center text-muted-foreground">Cargando productos...</p>
                                ) : (
                                    filteredProducts?.map((product) => (
                                        <Card key={product.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleAddToCart(product)}>
                                            <CardHeader className="p-3">
                                                <CardTitle className="text-sm">{product.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 pt-0">
                                                <div className="text-lg font-bold">${parseFloat(product.price).toFixed(2)}</div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="cart" className="h-full overflow-hidden">
                        <div className="flex flex-col h-full gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold">Carrito</h2>
                                <Button variant="ghost" size="icon" onClick={() => clearCart()}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2">
                                {items.map((item) => (
                                    <Card key={item.productId}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-sm text-muted-foreground">${item.price.toFixed(2)} c/u</div>
                                                </div>
                                                <div className="text-right font-bold">
                                                    ${(item.price * item.quantity).toFixed(2)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 justify-center">
                                                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {items.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Carrito vacío
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 border-t pt-4">
                                <div className="flex items-center gap-2">
                                    <Label>Método de Pago:</Label>
                                    <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CASH">Efectivo</SelectItem>
                                            <SelectItem value="CARD">Tarjeta</SelectItem>
                                            <SelectItem value="QR">QR / Transf.</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center justify-between text-xl font-bold border-t pt-4">
                                    <span>Total:</span>
                                    <span>${total().toFixed(2)}</span>
                                </div>
                                <Button
                                    className="w-full h-12 text-lg"
                                    size="lg"
                                    disabled={items.length === 0 || saleMutation.isPending}
                                    onClick={() => saleMutation.mutate()}
                                >
                                    {saleMutation.isPending ? 'Procesando...' : (
                                        <>
                                            <ShoppingCart className="mr-2 h-5 w-5" /> Cobrar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid lg:grid-cols-[1fr_450px] gap-6 h-[calc(100vh-140px)]">
                <div className="flex flex-col gap-4 overflow-hidden">
                    <div className="flex items-center gap-4">
                        <Input
                            placeholder="Buscar productos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1"
                        />
                    </div>

                    <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4">
                        {isLoading ? (
                            <p>Cargando productos...</p>
                        ) : (
                            filteredProducts?.map((product) => (
                                <Card key={product.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleAddToCart(product)}>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base">{product.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="text-2xl font-bold">${parseFloat(product.price).toFixed(2)}</div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex flex-col h-full border-l pl-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Carrito</h2>
                        <Button variant="ghost" size="icon" onClick={() => clearCart()}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto mb-4 border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="w-[100px]">Cant.</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.productId}>
                                        <TableCell className="font-medium">
                                            {item.name}
                                            <div className="text-xs text-muted-foreground">${item.price.toFixed(2)}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}>
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-4 text-center">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            Carrito vacío
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Label>Método de Pago:</Label>
                            <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Efectivo</SelectItem>
                                    <SelectItem value="CARD">Tarjeta</SelectItem>
                                    <SelectItem value="QR">QR / Transf.</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between text-2xl font-bold border-t pt-4">
                            <span>Total:</span>
                            <span>${total().toFixed(2)}</span>
                        </div>
                        <Button
                            className="w-full h-12 text-lg"
                            size="lg"
                            disabled={items.length === 0 || saleMutation.isPending}
                            onClick={() => saleMutation.mutate()}
                        >
                            {saleMutation.isPending ? 'Procesando...' : (
                                <>
                                    <ShoppingCart className="mr-2 h-5 w-5" /> Cobrar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
