import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const [showOverlay, setShowOverlay] = useState(false);
    
    // Manage overlay visibility
    useEffect(() => {
        if (isOpen) {
            setShowOverlay(true);
        } else {
            const timer = setTimeout(() => setShowOverlay(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Close sidebar ONLY when route changes
    const prevPathRef = useRef(location.pathname);

    useEffect(() => {
        if (prevPathRef.current !== location.pathname) {
            // Route changed
            if (isOpen && window.innerWidth < 1024 && onClose) {
                onClose();
            }
            prevPathRef.current = location.pathname;
        }
    }, [location.pathname, isOpen, onClose]);

    const navItems = [
        { path: '/', label: t('navigation.dashboard'), icon: '📊' },
        { path: '/projects', label: t('navigation.projects'), icon: '📁' },
        { path: '/tasks', label: t('navigation.tasks'), icon: '✅' },
        { path: '/resource-allocations', label: t('navigation.resourceAllocations'), icon: '👥' },
        { path: '/users', label: t('navigation.users'), icon: '👤' },
        { path: '/analytics', label: t('navigation.analytics'), icon: '📈' },
    ];

    function getLinkClassName(isActive: boolean): string {
        const baseClass = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium';
        if (isActive) {
            return baseClass + ' bg-gray-300 text-gray-900 shadow-sm transform scale-105';
        }
        return baseClass + ' text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm';
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300 ${
                        showOverlay ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={onClose}
                />
            )}
            
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-gray-50 to-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                }}
                onTouchStart={(e) => {
                    e.stopPropagation();
                }}
            >
                <div className="p-4 h-full overflow-y-auto">
                    {/* Mobile close button */}
                    <div className="flex justify-between items-center mb-6 lg:hidden">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                            Navigation
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                            aria-label="Close menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {/* Desktop Navigation Title */}
                    <div className="mb-6 hidden lg:block">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
                            Navigation
                        </h2>
                    </div>
                <nav>
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || 
                                           (item.path !== '/' && location.pathname.startsWith(item.path));
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={getLinkClassName(isActive)}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="text-sm">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
                
                {/* Footer section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="px-4">
                        <p className="text-xs text-gray-500 text-center">
                            Resource Management SaaS
                        </p>
                        <p className="text-xs text-gray-400 text-center mt-1">
                            v1.0.0
                        </p>
                    </div>
                </div>
                </div>
            </aside>
        </>
    );
}
