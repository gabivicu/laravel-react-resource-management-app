import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Modal from '../ui/Modal';
import ProfileEditForm from '../users/ProfileEditForm';
import { useAuthStore } from '@/store/auth';
import { useTranslation } from 'react-i18next';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const authStore = useAuthStore();
    const user = authStore.user;
    const { t } = useTranslation();

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
        <div className="min-h-screen bg-gray-50" data-testid="app-layout">
            <Header onMenuClick={handleMenuClick} onEditProfile={() => setIsProfileModalOpen(true)} />
            <div className="flex">
                <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
                <main className="flex-1 p-4 sm:p-6 bg-gray-50 min-w-0" data-testid="main-content">
                    {children}
                </main>
            </div>

            {/* Profile Edit Modal */}
            {user && (
                <Modal
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    title={t('auth.editProfile')}
                >
                    <ProfileEditForm
                        user={user}
                        onSuccess={() => setIsProfileModalOpen(false)}
                        onCancel={() => setIsProfileModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}
