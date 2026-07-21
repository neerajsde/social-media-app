import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import RightSidebar from '@/components/layout/RightSidebar';
import AuthGuard from '@/components/auth/AuthGuard';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-16 md:pb-0 relative">
          <div className="flex max-w-6xl mx-auto min-h-screen">
            <div className="flex-1 min-w-0 flex flex-col">
              {children}
            </div>
            <RightSidebar />
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <MobileNav />
      </div>
    </AuthGuard>
  );
}
