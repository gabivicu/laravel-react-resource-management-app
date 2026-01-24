import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleMenuClick = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setSidebarOpen((prev) => {
            const newState = !prev;
            // Prevent body scroll when sidebar is open on mobile
            if (newState && window.innerWidth < 1024) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            return newState;
        });
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
        document.body.style.overflow = '';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header onMenuClick={handleMenuClick} />
            <div className="flex">
                <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
                <main className="flex-1 p-4 sm:p-6 bg-gray-50 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
