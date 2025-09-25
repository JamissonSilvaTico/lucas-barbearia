import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Service } from '../../types';
import { TrashIcon, PencilIcon, PlusIcon } from '../../components/icons/Icon';

const ServiceModal: React.FC<{
    service: Service | null;
    onClose: () => void;
    onSave: (service: Service | Omit<Service, 'id'>) => Promise<void>;
}> = ({ service, onClose, onSave }) => {
    const [name, setName] = useState(service?.name || '');
    const [price, setPrice] = useState(service?.price || 0);
    const [duration, setDuration] = useState(service?.duration || 30);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const serviceData = {
            name,
            price,
            duration,
        };
        try {
            if (service?.id) {
                await onSave({ ...serviceData, id: service.id });
            } else {
                await onSave(serviceData);
            }
            onClose();
        } catch (err) {
            console.error(err);
            alert('Falha ao salvar serviço');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-1 rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{service ? 'Editar Serviço' : 'Novo Serviço'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nome do Serviço" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-dark-3 p-3 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary" />
                    <input type="number" placeholder="Preço (R$)" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full bg-dark-3 p-3 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary" />
                    <input type="number" step="5" placeholder="Duração (minutos)" value={duration} onChange={e => setDuration(Number(e.target.value))} required className="w-full bg-dark-3 p-3 rounded-md border border-dark-3 focus:border-brand-primary focus:ring-brand-primary" />
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-dark-3 text-light-1 font-bold py-2 px-4 rounded-md hover:bg-dark-3/80">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="bg-brand-primary text-dark-1 font-bold py-2 px-4 rounded-md hover:bg-brand-secondary disabled:bg-gray-500">
                           {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const AdminServicesPage: React.FC = () => {
    const { services, addService, updateService, deleteService, isLoading } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const handleSave = async (service: Service | Omit<Service, 'id'>) => {
        if ('id' in service) {
            await updateService(service);
        } else {
            await addService(service);
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este serviço? Todos os agendamentos vinculados a ele perderão a referência.')) {
            deleteService(id);
        }
    };

    const openModal = (service: Service | null = null) => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-brand-primary">Gerenciar Serviços</h1>
                <button onClick={() => openModal()} className="bg-brand-primary text-dark-1 font-bold py-2 px-4 rounded-md flex items-center gap-2 hover:bg-brand-secondary">
                    <PlusIcon className="w-5 h-5"/>
                    Novo Serviço
                </button>
            </div>
            
            <div className="bg-dark-1 rounded-lg overflow-hidden">
                {isLoading ? <p className="text-center p-8">Carregando serviços...</p> : (
                <table className="w-full text-left">
                    <thead className="bg-dark-3">
                        <tr>
                            <th className="p-4">Nome</th>
                            <th className="p-4">Preço</th>
                            <th className="p-4">Duração</th>
                            <th className="p-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id} className="border-b border-dark-3 hover:bg-dark-3/50">
                                <td className="p-4">{service.name}</td>
                                <td className="p-4">R$ {service.price.toFixed(2)}</td>
                                <td className="p-4">{service.duration} min</td>
                                <td className="p-4 flex gap-4">
                                    <button onClick={() => openModal(service)} className="text-brand-secondary hover:text-brand-primary">
                                        <PencilIcon className="w-5 h-5"/>
                                    </button>
                                    <button onClick={() => handleDelete(service.id)} className="text-red-500 hover:text-red-400">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
                 {!isLoading && services.length === 0 && <p className="text-center p-8 text-light-3">Nenhum serviço cadastrado.</p>}
            </div>

            {isModalOpen && <ServiceModal service={selectedService} onClose={() => setIsModalOpen(false)} onSave={handleSave} />}
        </div>
    );
};

export default AdminServicesPage;
