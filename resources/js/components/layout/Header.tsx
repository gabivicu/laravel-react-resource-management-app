import { useAuthStore } from '@/store/auth';

export default function Header() {
    const authStore = useAuthStore();
    const user = authStore.user;
    const logout = authStore.logout;
    const currentOrganization = authStore.currentOrganization;

    return (
        <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
            <div className="px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-blue-600 text-lg font-bold">RM</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Resource Management SaaS</h1>
                        {currentOrganization && (
                            <p className="text-sm text-blue-100">{currentOrganization.name}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <span className="text-sm text-white font-medium">{user?.name}</span>
                    </div>
                    <button
                        onClick={logout}
                        className="px-5 py-2 text-sm bg-white text-blue-600 rounded-lg transition-all font-semibold hover:bg-gray-100 hover:shadow-md border border-white border-opacity-30"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
