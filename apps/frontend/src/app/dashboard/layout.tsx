import { DashboardNav } from '@/components/dashboard-nav';
import { MobileNav } from '@/components/mobile-nav';
import { UserNav } from '@/components/user-nav';
import { Separator } from '@/components/ui/separator';
import { AuthGuard } from '@/components/auth-guard';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthGuard>
            <div className="flex min-h-screen">
                {/* Sidebar for Desktop */}
                <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 bg-background border-r">
                    <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h2 className="text-xl font-bold tracking-tight">Licorería</h2>
                        </div>
                        <Separator className="my-4" />
                        <nav className="flex-1 px-2 space-y-1">
                            <DashboardNav />
                        </nav>
                    </div>
                </aside>

                {/* Main content area */}
                <div className="flex flex-col flex-1 md:pl-64">
                    {/* Top header */}
                    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:px-8">
                        {/* Mobile menu button */}
                        <MobileNav />

                        <div className="flex items-center flex-1 gap-2">
                            <h2 className="text-lg font-semibold tracking-tight md:hidden">Licorería</h2>
                        </div>

                        <UserNav />
                    </header>

                    {/* Main content */}
                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
