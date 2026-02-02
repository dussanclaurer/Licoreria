'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

// Define Product type based on backend
interface Product {
    id: string;
    name: string;
    price: string; // Decimal comes as string from JSON often
    description?: string;
}

export default function POSPage() {
    const [search, setSearch] = useState('');
    const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();

    const { data: products, isLoading } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await api.get('/products');
            return data;
        },
    });

    const saleMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                items: items.map((i) => ({
                    productId: i.productId,
                    quantity: i.quantity,
                })),
            };
            await api.post('/sales', payload);
        },
        onSuccess: () => {
            toast.success('Venta registrada correctamente');
            clearCart();
        },
        onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error(error.response?.data?.error || 'Error al registrar venta');
        },
    });

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

    return (
        <div className="grid h-[calc(100vh-80px)] md:grid-cols-[1fr_400px] gap-6">
            <div className="flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Buscar productos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-20">
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
                    <h2 className="text-xl font-bold">Carrito de Compras</h2>
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
                                <ShoppingCart className="mr-2 h-5 w-5" /> Confirmar Venta
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
