import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Backdrop } from '@/components/common';
import { useBreakpoints } from '@/hooks';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isDesktop } = useBreakpoints();
  // Su desktop, la sidebar è aperta di default; su mobile è chiusa
  const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header onToggleSidebar={toggleSidebar} />

      {/* Spacer per compensare l'header fixed (h-14 = 56px) */}
      <div className="h-14 flex-shrink-0" />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Backdrop per mobile quando la sidebar è aperta */}
        {!isDesktop && <Backdrop isOpen={isSidebarOpen} onClose={closeSidebar} zIndex={40} />}

        {/* Sidebar - drawer overlay su mobile, fixed su desktop */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
