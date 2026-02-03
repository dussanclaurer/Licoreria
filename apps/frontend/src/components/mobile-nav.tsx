'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { DashboardNav } from './dashboard-nav';
import { useState } from 'react';

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[240px] sm:w-[280px]">
                <div className="px-1 py-6">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Menú
                    </h2>
                    <DashboardNav onItemClick={() => setOpen(false)} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
