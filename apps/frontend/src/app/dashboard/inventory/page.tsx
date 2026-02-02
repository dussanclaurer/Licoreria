'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Package, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// -- Schema for Product --
const productSchema = z.object({
    name: z.string().min(3, "Name required"),
    price: z.preprocess((val) => Number(val), z.number().positive()),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    minStock: z.preprocess((val) => Number(val), z.number().int().nonnegative().default(10)),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface Product {
    id: string;
    name: string;
    price: string;
    description?: string;
    imageUrl?: string;
    minStock: number;
}

export default function InventoryPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // -- Queries --
    const { data: products, isLoading } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await api.get('/products');
            return data;
        },
    });

    // -- Mutations --
    const createMutation = useMutation({
        mutationFn: async (data: ProductFormValues) => {
            await api.post('/products', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setIsCreateOpen(false);
            toast.success('Producto creado');
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: ProductFormValues }) => {
            await api.put(`/products/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            setEditingProduct(null);
            toast.success('Producto actualizado');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success('Producto eliminado');
        },
    });

    const filtered = products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Inventario Generales</h1>
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    placeholder="Buscar producto..."
                    className="max-w-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Stock Mín.</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4}>Cargando...</TableCell></TableRow>
                        ) : filtered?.length === 0 ? (
                            <TableRow><TableCell colSpan={4}>No se encontraron productos.</TableCell></TableRow>
                        ) : (
                            filtered?.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{product.name}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>${parseFloat(product.price).toFixed(2)}</TableCell>
                                    <TableCell>{product.minStock}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Package className="h-4 w-4 mr-2" /> Lotes
                                                </Button>
                                            </DialogTrigger>
                                            <AddBatchDialog productId={product.id} productName={product.name} />
                                        </Dialog>

                                        <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => {
                                            if (confirm('¿Eliminar producto?')) deleteMutation.mutate(product.id);
                                        }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create Dialog */}
            <ProductDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSubmit={(data) => createMutation.mutate(data)}
                title="Crear Nuevo Producto"
            />

            {/* Edit Dialog */}
            <ProductDialog
                open={!!editingProduct}
                onOpenChange={(open) => !open && setEditingProduct(null)}
                onSubmit={(data) => updateMutation.mutate({ id: editingProduct!.id, data })}
                defaultValues={editingProduct ? {
                    name: editingProduct.name,
                    price: parseFloat(editingProduct.price),
                    description: editingProduct.description || '',
                    imageUrl: editingProduct.imageUrl || '',
                    minStock: editingProduct.minStock
                } : undefined}
                title="Editar Producto"
            />
        </div>
    );
}

// -- Sub Components --

function ProductDialog({ open, onOpenChange, onSubmit, defaultValues, title }: any) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues
    });

    // Effect to reset form when defaultValues change would be needed in real app or use key
    // For MVP, simplistic handling.

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input {...register('name')} defaultValue={defaultValues?.name} />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Precio ($)</Label>
                            <Input type="number" step="0.01" {...register('price')} defaultValue={defaultValues?.price} />
                            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Stock Mínimo</Label>
                            <Input type="number" {...register('minStock')} defaultValue={defaultValues?.minStock ?? 10} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Input {...register('description')} defaultValue={defaultValues?.description} />
                    </div>
                    <div className="space-y-2">
                        <Label>URL Imagen (Opcional)</Label>
                        <Input {...register('imageUrl')} placeholder="https://..." defaultValue={defaultValues?.imageUrl} />
                        {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="submit">Guardar</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AddBatchDialog({ productId, productName }: { productId: string, productName: string }) {
    const queryClient = useQueryClient();
    const batchSchema = z.object({
        quantity: z.preprocess((val) => Number(val), z.number().int().positive()),
        expirationDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid Date"),
    });

    const { register, handleSubmit, reset } = useForm<z.infer<typeof batchSchema>>({
        resolver: zodResolver(batchSchema)
    });

    const mutation = useMutation({
        mutationFn: async (data: z.infer<typeof batchSchema>) => {
            await api.post('/batches', {
                productId,
                quantity: data.quantity,
                expirationDate: new Date(data.expirationDate).toISOString()
            });
        },
        onSuccess: () => {
            toast.success(`Lote agregado a ${productName}`);
            reset();
            // In a real app we might verify if query needs invalidation (e.g. alerts)
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        }
    });

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Recibir Mercadería: {productName}</DialogTitle>
                <DialogDescription>
                    Registra la entrada de un nuevo lote con fecha de vencimiento.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                <div className="space-y-2">
                    <Label>Cantidad (Unidades)</Label>
                    <Input type="number" {...register('quantity')} />
                </div>
                <div className="space-y-2">
                    <Label>Fecha de Vencimiento</Label>
                    <Input type="date" {...register('expirationDate')} />
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Guardando...' : 'Registrar Ingreso'}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}
