import { UserCircleIcon } from './IconComponents';
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Senha do usuário, opcional para migração
}

export interface Category {
  id: string;
  name: string;
}

export type Currency = 'BRL' | 'USD' | 'EUR';

export interface Activity {
  id: string;
  name: string;
  time: string;
  description?: string;
  estimatedCost: number;
  realCost?: number;
  isConfirmed: boolean;
  participants: string[]; // Array of user names
  category: string;
}

export interface Day {
  date: string;
  dayNumber: number;
  activities: Activity[];
}

export interface Participant {
  name:string;
  email: string;
  permission: 'EDIT' | 'VIEW_ONLY';
}

export interface TripPreferences {
  likes: string[];
  dislikes: string[];
  budgetStyle: 'economico' | 'confortavel' | 'luxo' | 'exclusivo';
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  budget: number;
  days: Day[];
  participants: Participant[];
  categories: Category[];
  currency: Currency;
  isCompleted: boolean;
  ownerEmail: string;
  preferences: TripPreferences;
}

export interface Invite {
  id: string;
  tripId: string;
  tripName: string;
  hostName: string;
  hostEmail: string;
  guestEmail: string;
  permission: 'EDIT' | 'VIEW_ONLY';
  status: 'PENDING' | 'REJECTED';
}