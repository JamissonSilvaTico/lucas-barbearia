
import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ScissorsIcon, CalendarIcon, UserIcon, LogoutIcon, HomeIcon } from './icons/Icon';

const AdminLayout: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    const navItems = [
        { path: '/admin/dashboard', label: 'Agendamentos', icon: CalendarIcon },
        { path: '/admin/servicos', label: 'Serviços', icon: ScissorsIcon },
        { path: '/admin/configuracoes', label: 'Configurações', icon: UserIcon },
    ];

    return (
        <div className="min-h-screen flex bg-dark-2">
            <aside className="w-64 bg-dark-1 p-4 flex flex-col justify-between">
                <div>
                    <div className="text-brand-primary text-2xl font-bold mb-8 flex items-center gap-2">
                        <ScissorsIcon className="w-8 h-8"/>
                        <span>Admin</span>
                    </div>
                    <nav>
                        <ul>
                            {navItems.map((item) => (
                                <li key={item.path} className="mb-2">
                                    <Link 
                                        to={item.path} 
                                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                            location.pathname === item.path 
                                            ? 'bg-brand-primary text-dark-1' 
                                            : 'text-light-2 hover:bg-dark-3'
                                        }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div className="space-y-2">
                     <Link to="/" className="flex items-center gap-3 p-3 rounded-lg text-light-2 hover:bg-dark-3 transition-colors">
                        <HomeIcon className="w-5 h-5" />
                        <span>Página Inicial</span>
                    </Link>
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center gap-3 p-3 rounded-lg text-light-2 hover:bg-red-500/80 transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
