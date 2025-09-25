export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientInstagram?: string;
  serviceId: string;
  date: string; // ISO string for date part
  time: string; // "HH:mm" format
  createdAt: string; // ISO string
}

export interface HomePageContent {
  title: string;
  subtitle: string;
  description: string;
  ctaButtonLink: string;
}

// Fix: Manually define types for import.meta.env to resolve TypeScript errors
// in projects where vite/client types cannot be found.
declare global {
  // Fix: Resolved 'Subsequent property declarations must have the same type' error by augmenting ImportMetaEnv instead of redeclaring ImportMeta.
  interface ImportMetaEnv {
    readonly VITE_API_URL: string;
  }
}
