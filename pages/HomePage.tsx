import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const HomePage: React.FC = () => {
    const { homeContent, isLoading } = useData();

    if (isLoading || !homeContent) {
        return (
            <div className="min-h-screen bg-dark-1 flex items-center justify-center">
                <div className="text-brand-primary text-2xl">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-1 flex items-center justify-center text-center p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-extrabold text-brand-primary mb-4 animate-fade-in-down">
                    {homeContent.title}
                </h1>
                <h2 className="text-2xl md:text-3xl text-light-1 mb-6 animate-fade-in-up animation-delay-300">
                    {homeContent.subtitle}
                </h2>
                <p className="text-lg text-light-2 max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-500">
                    {homeContent.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-700">
                    <Link
                        to="/agendar"
                        className="bg-brand-primary text-dark-1 font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-secondary transition-transform transform hover:scale-105"
                    >
                        Agendar Horário
                    </Link>
                    <a
                        href={homeContent.ctaButtonLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-transparent border-2 border-brand-primary text-brand-primary font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-primary hover:text-dark-1 transition-all"
                    >
                        Fale Agora
                    </a>
                </div>
            </div>
             <style>{`
                @keyframes fade-in-down {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-500 { animation-delay: 0.5s; }
                .animation-delay-700 { animation-delay: 0.7s; }
            `}</style>
        </div>
    );
};

export default HomePage;
