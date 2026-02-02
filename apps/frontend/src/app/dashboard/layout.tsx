import { DashboardNav } from '@/components/dashboard-nav';
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
            <div className="flex min-h-screen flex-col space-y-6">
                <header className="sticky top-0 z-40 border-b bg-background">
                    <div className="container flex h-16 items-center justify-between py-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold tracking-tight">Licorería System</h2>
                        </div>
                        <UserNav />
                    </div>
                </header>
                <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
                    <aside className="hidden w-[200px] flex-col md:flex">
                        <DashboardNav />
                    </aside>
                    <main className="flex w-full flex-1 flex-col overflow-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </AuthGuard>
    );
}
