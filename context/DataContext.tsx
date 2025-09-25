import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { Service, Appointment, HomePageContent } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

interface DataContextType {
  services: Service[];
  appointments: Appointment[];
  homeContent: HomePageContent | null;
  isLoading: boolean;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  updateHomeContent: (content: HomePageContent) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [homeContent, setHomeContent] = useState<HomePageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/data`);
      const data = await response.json();
      setServices(data.services || []);
      setAppointments(data.appointments || []);
      setHomeContent(data.homeContent || null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const apiRequest = async (endpoint: string, method: string, body?: any) => {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok && response.status !== 204) {
      throw new Error(`API request failed: ${method} ${endpoint}`);
    }
    // Refetch all data to ensure UI consistency. A more optimized approach
    // would be to update the local state directly with the response.
    await fetchData();
  };
  
  const addService = (service: Omit<Service, 'id'>) => apiRequest('/services', 'POST', service);
  const updateService = (service: Service) => apiRequest(`/services/${service.id}`, 'PUT', service);
  const deleteService = (id: string) => apiRequest(`/services/${id}`, 'DELETE');
  
  const addAppointment = (appointment: Omit<Appointment, 'id'|'createdAt'>) => apiRequest('/appointments', 'POST', appointment);
  const deleteAppointment = (id: string) => apiRequest(`/appointments/${id}`, 'DELETE');

  const updateHomeContent = (content: HomePageContent) => apiRequest('/content', 'PUT', content);

  return (
    <DataContext.Provider value={{ services, appointments, homeContent, isLoading, addService, updateService, deleteService, addAppointment, deleteAppointment, updateHomeContent }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
