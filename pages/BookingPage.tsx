import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Service } from '../types';
import { UserIcon, ScissorsIcon, CalendarIcon, ClockIcon, CheckCircleIcon } from '../components/icons/Icon';

const BookingPage: React.FC = () => {
    const { services, appointments, addAppointment, isLoading } = useData();
    const [step, setStep] = useState(1);

    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientInstagram, setClientInstagram] = useState('');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const availableTimes = useMemo(() => {
        if (!selectedDate || !selectedService) return [];

        const times: string[] = [];
        const workStart = 9 * 60; // 9:00 in minutes
        const workEnd = 19 * 60; // 19:00 in minutes
        const lunchStart = 12 * 60;
        const lunchEnd = 13 * 60;
        const { duration } = selectedService;

        const appointmentsOnDate = appointments.filter(a => a.date === selectedDate);
        const now = new Date();
        const isToday = new Date(selectedDate + 'T00:00:00').toDateString() === now.toDateString();

        for (let time = workStart; time <= workEnd - duration; time += 15) {
            const slotStart = time;
            const slotEnd = time + duration;

            if (slotStart >= lunchStart && slotStart < lunchEnd) continue;
            if (slotEnd > lunchStart && slotStart < lunchEnd) continue;

            const isOccupied = appointmentsOnDate.some(a => {
                const service = services.find(s => s.id === a.serviceId);
                if (!service) return false;
                const existingStart = parseInt(a.time.split(':')[0]) * 60 + parseInt(a.time.split(':')[1]);
                const existingEnd = existingStart + service.duration;
                return slotStart < existingEnd && slotEnd > existingStart;
            });
            
            const hours = Math.floor(slotStart / 60);
            const minutes = slotStart % 60;
            const slotDate = new Date(selectedDate);
            slotDate.setHours(hours, minutes, 0, 0);

            if (!isOccupied && (!isToday || slotDate > now)) {
                times.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
            }
        }
        return times;
    }, [selectedDate, selectedService, appointments, services]);

    const handleNextStep = () => {
        setError('');
        if (step === 1 && (!clientName || !clientPhone)) {
            setError('Nome e telefone são obrigatórios.');
            return;
        }
        if (step === 2 && !selectedService) {
            setError('Selecione um serviço.');
            return;
        }
        if (step === 3 && (!selectedDate || !selectedTime)) {
             setError('Selecione data e hora.');
            return;
        }
        if (step < 4) {
            setStep(s => s + 1);
        }
    };
    
    const handlePrevStep = () => {
        if (step > 1) setStep(s => s - 1);
    }
    
    const handleSubmit = async () => {
        if (!clientName || !clientPhone || !selectedService || !selectedDate || !selectedTime) {
            setError('Erro ao finalizar. Verifique os dados.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await addAppointment({
                clientName,
                clientPhone,
                clientInstagram,
                serviceId: selectedService.id,
                date: selectedDate,
                time: selectedTime,
            });
            setStep(5); // Confirmation step
        } catch (err) {
            console.error(err);
            setError('Falha ao criar agendamento. Tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
    }
    
    if (isLoading) {
      return <div className="min-h-screen bg-dark-1 flex items-center justify-center text-brand-primary text-2xl">Carregando...</div>;
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-brand-primary">Informações Pessoais</h2>
                        <div className="space-y-4">
                            <input type="text" placeholder="Seu Nome" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-dark-3 p-3 rounded-lg border border-dark-3 focus:border-brand-primary focus:ring-brand-primary" />
                            <input type="tel" placeholder="Seu Telefone" value={clientPhone} onChange={e => setClientPhone(e.target.value)} className="w-full bg-dark-3 p-3 rounded-lg border border-dark-3 focus:border-brand-primary focus:ring-brand-primary" />
                            <input type="text" placeholder="Seu Instagram (opcional)" value={clientInstagram} onChange={e => setClientInstagram(e.target.value)} className="w-full bg-dark-3 p-3 rounded-lg border border-dark-3 focus:border-brand-primary focus:ring-brand-primary" />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-brand-primary">Selecione o Serviço</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {services.map(service => (
                                <div key={service.id} onClick={() => setSelectedService(service)} className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${selectedService?.id === service.id ? 'bg-brand-primary/20 border-brand-primary' : 'bg-dark-3 border-transparent hover:border-brand-primary/50'}`}>
                                    <h3 className="font-bold text-lg">{service.name}</h3>
                                    <p className="text-light-3">Duração: {service.duration} min</p>
                                    <p className="text-brand-secondary font-semibold">R$ {service.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-brand-primary">Escolha Data e Hora</h2>
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <label className="block mb-2 font-semibold">Data</label>
                                <input type="date" min={today} value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedTime(''); }} className="w-full bg-dark-3 p-3 rounded-lg border border-dark-3 focus:border-brand-primary focus:ring-brand-primary" />
                            </div>
                            <div className="flex-1">
                                <label className="block mb-2 font-semibold">Horários Disponíveis</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                                    {availableTimes.length > 0 ? (
                                        availableTimes.map(time => (
                                            <button key={time} onClick={() => setSelectedTime(time)} className={`p-2 rounded-lg transition-colors ${selectedTime === time ? 'bg-brand-primary text-dark-1' : 'bg-dark-3 hover:bg-brand-primary/50'}`}>
                                                {time}
                                            </button>
                                        ))
                                    ) : <p className="col-span-full text-light-3">Nenhum horário disponível.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-6 text-brand-primary">Confirmação</h2>
                        <div className="bg-dark-3 p-6 rounded-lg space-y-4">
                            <div><strong className="text-brand-secondary">Nome:</strong> {clientName}</div>
                            <div><strong className="text-brand-secondary">Telefone:</strong> {clientPhone}</div>
                            {clientInstagram && <div><strong className="text-brand-secondary">Instagram:</strong> {clientInstagram}</div>}
                            <div><strong className="text-brand-secondary">Serviço:</strong> {selectedService?.name}</div>
                            <div><strong className="text-brand-secondary">Data:</strong> {selectedDate && new Date(selectedDate+'T00:00:00').toLocaleDateString('pt-BR')}</div>
                            <div><strong className="text-brand-secondary">Hora:</strong> {selectedTime}</div>
                            <div className="text-xl font-bold pt-4 border-t border-dark-2"><strong className="text-brand-secondary">Total:</strong> R$ {selectedService?.price.toFixed(2)}</div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="text-center">
                        <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4 text-brand-primary">Agendamento Confirmado!</h2>
                        <p className="text-light-2 mb-8">Seu horário foi reservado com sucesso. Obrigado!</p>
                        <Link to="/" className="bg-brand-primary text-dark-1 font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-secondary transition-transform transform hover:scale-105">
                            Voltar para a Página Inicial
                        </Link>
                    </div>
                )
            default:
                return null;
        }
    };
    
    const progressPercentage = (step - 1) / 3 * 100;

    return (
        <div className="min-h-screen bg-dark-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-dark-2 rounded-xl shadow-lg p-8">
                {step < 5 ? (
                    <>
                        <div className="mb-8">
                            <div className="flex justify-between text-sm font-semibold text-light-3 mb-2">
                                <span className={step >= 1 ? 'text-brand-primary' : ''}>Pessoal</span>
                                <span className={step >= 2 ? 'text-brand-primary' : ''}>Serviço</span>
                                <span className={step >= 3 ? 'text-brand-primary' : ''}>Data/Hora</span>
                                <span className={step >= 4 ? 'text-brand-primary' : ''}>Confirmar</span>
                            </div>
                            <div className="w-full bg-dark-3 rounded-full h-2.5">
                                <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                        
                        <div className="min-h-[300px]">{renderStep()}</div>
                        
                        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
                        
                        <div className="flex justify-between mt-8">
                            {step > 1 ? (
                                <button onClick={handlePrevStep} className="bg-dark-3 text-light-1 font-bold py-2 px-6 rounded-lg hover:bg-dark-3/80 transition-colors">Voltar</button>
                            ) : <div></div>}
                            {step < 4 ? (
                                <button onClick={handleNextStep} className="bg-brand-primary text-dark-1 font-bold py-2 px-6 rounded-lg hover:bg-brand-secondary transition-colors">Próximo</button>
                            ) : (
                                <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500">
                                    {isSubmitting ? 'Finalizando...' : 'Finalizar Agendamento'}
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    renderStep()
                )}
            </div>
            {step < 5 && <Link to="/" className="mt-4 text-brand-primary hover:underline">Voltar à página inicial</Link>}
        </div>
    );
};

export default BookingPage;
