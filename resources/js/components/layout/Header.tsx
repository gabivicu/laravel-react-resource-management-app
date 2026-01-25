import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth';
import LanguageSelector from '../ui/LanguageSelector';

interface HeaderProps {
    onMenuClick?: (e?: React.MouseEvent) => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { t } = useTranslation();
    const authStore = useAuthStore();
    const user = authStore.user;
    const logout = authStore.logout;
    const currentOrganization = authStore.currentOrganization;

    return (
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    {/* Hamburger menu button for mobile */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (onMenuClick) {
                                onMenuClick(e);
                            }
                        }}
                        onTouchStart={(e) => {
                            e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                        }}
                        className="lg:hidden p-2 rounded-lg hover:bg-blue-500 transition-colors mr-2 z-50 relative"
                        aria-label="Toggle menu"
                        type="button"
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-blue-600 text-sm sm:text-lg font-bold">RM</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-base sm:text-xl font-bold text-white truncate">{t('header.appName')}</h1>
                        {currentOrganization && (
                            <p className="text-xs sm:text-sm text-blue-100 truncate">{currentOrganization.name}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <LanguageSelector />
                    <div className="hidden sm:flex items-center gap-3">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="text-sm text-white font-medium">{user?.name}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-blue-600 rounded-lg transition-all font-semibold hover:bg-gray-100 hover:shadow-md border border-white border-opacity-30 whitespace-nowrap"
                    >
                        {t('auth.logout')}
                    </button>
                </div>
            </div>
        </header>
    );
}
