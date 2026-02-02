'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Package, LayoutDashboard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const items = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Punto de Venta',
        href: '/dashboard/pos',
        icon: ShoppingCart,
    },
    {
        title: 'Inventario',
        href: '/dashboard/inventory',
        icon: Package,
    },
    {
        title: 'Configuración',
        href: '/dashboard/settings',
        icon: Settings,
    },
];

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <nav className="grid items-start gap-2">
            {items.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={index}
                        href={item.href}
                    >
                        <span
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                            )}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            <span>{item.title}</span>
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
