import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ScissorsIcon } from '../../components/icons/Icon';

const AdminLoginPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await login(password);
        if (success) {
            navigate('/admin/dashboard');
        } else {
            setError('Senha incorreta.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-2 flex items-center justify-center">
            <div className="w-full max-w-sm p-8 bg-dark-1 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <ScissorsIcon className="w-12 h-12 text-brand-primary mx-auto mb-2"/>
                    <h1 className="text-3xl font-bold text-light-1">Admin Login</h1>
                    <p className="text-light-3">Lucas Barbearia</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-light-3 mb-2" htmlFor="password">Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-3 p-3 rounded-lg border border-dark-3 focus:border-brand-primary focus:ring-brand-primary"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-primary text-dark-1 font-bold py-3 rounded-lg hover:bg-brand-secondary transition-colors disabled:bg-gray-500"
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
