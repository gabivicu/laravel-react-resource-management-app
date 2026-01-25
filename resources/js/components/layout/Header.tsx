import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth';
import LanguageSelector from '../ui/LanguageSelector';

interface HeaderProps {
    onMenuClick?: (e?: React.MouseEvent) => void;
    onEditProfile?: () => void;
}

export default function Header({ onMenuClick, onEditProfile }: HeaderProps) {
    const { t } = useTranslation();
    const authStore = useAuthStore();
    const user = authStore.user;
    const logout = authStore.logout;
    const currentOrganization = authStore.currentOrganization;
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        if (isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const handleEditProfile = () => {
        setIsUserMenuOpen(false);
        if (onEditProfile) {
            onEditProfile();
        }
    };

    const handleLogout = () => {
        setIsUserMenuOpen(false);
        logout();
    };

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
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                            aria-label="User menu"
                        >
                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                {user?.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user?.name || 'User'} 
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white text-sm font-medium">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm text-white font-medium">{user?.name}</span>
                            <svg 
                                className={`w-4 h-4 text-white transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                                <button
                                    onClick={handleEditProfile}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {t('auth.editProfile')}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    {t('auth.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
