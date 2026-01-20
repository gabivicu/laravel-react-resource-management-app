import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/projects', label: 'Projects', icon: '📁' },
        { path: '/tasks', label: 'Tasks', icon: '✅' },
        { path: '/resource-allocations', label: 'Resources', icon: '👥' },
        { path: '/users', label: 'Users', icon: '👤' },
        { path: '/analytics', label: 'Analytics', icon: '📈' },
    ];

    function getLinkClassName(isActive: boolean): string {
        const baseClass = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium';
        if (isActive) {
            return baseClass + ' bg-gray-300 text-gray-900 shadow-sm transform scale-105';
        }
        return baseClass + ' text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm';
    }

    return (
        <aside className="w-64 bg-gradient-to-b from-gray-50 to-white shadow-lg min-h-screen border-r border-gray-200">
            <div className="p-4">
                <div className="mb-6">
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
    );
}
