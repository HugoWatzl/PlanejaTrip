import React, { useState } from 'react';
import { Trip, Category, Currency } from '../types';
import { XCircleIcon, UsersIcon, TagIcon, GlobeIcon, ArrowLeftIcon, PlusCircleIcon, TrashIcon } from './IconComponents';

interface SidebarProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onBackToProfile: () => void;
  onInvite: (trip: Trip, email: string, permission: 'EDIT' | 'VIEW_ONLY') => Promise<string | null>;
}

const Sidebar: React.FC<SidebarProps> = ({ trip, isOpen, onClose, onUpdateTrip, onBackToProfile, onInvite }) => {
    const [inviteData, setInviteData] = useState({ email: '', permission: 'VIEW_ONLY' as 'EDIT' | 'VIEW_ONLY' });
    const [newCategory, setNewCategory] = useState('');
    const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleInvite = async () => {
        setInviteFeedback(null);
        if (inviteData.email) {
            const result = await onInvite(trip, inviteData.email, inviteData.permission);
            if (result) {
                setInviteFeedback({ type: 'error', message: result });
            } else {
                setInviteFeedback({ type: 'success', message: 'Convite enviado!' });
                setInviteData({ email: '', permission: 'VIEW_ONLY' });
            }
        } else {
             setInviteFeedback({ type: 'error', message: 'O e-mail é obrigatório.' });
        }
    };
    
    const handleRemoveParticipant = (participantEmail: string) => {
        if (participantEmail === trip.ownerEmail) return; // Prevent owner removal
        onUpdateTrip({ ...trip, participants: trip.participants.filter(p => p.email !== participantEmail) });
    };

    const handleAddCategory = () => {
        if (newCategory && !trip.categories.find(c => c.name === newCategory)) {
            const category: Category = { id: Date.now().toString(), name: newCategory };
            onUpdateTrip({ ...trip, categories: [...trip.categories, category] });
            setNewCategory('');
        }
    };

    const handleRemoveCategory = (categoryId: string) => {
        onUpdateTrip({ ...trip, categories: trip.categories.filter(c => c.id !== categoryId) });
    };

    const handleCurrencyChange = (currency: Currency) => {
        onUpdateTrip({ ...trip, currency });
    };
    
  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-60 z-30 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <div className={`fixed top-0 left-0 h-full bg-brand-light w-80 shadow-2xl z-40 transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} p-6 flex flex-col text-brand-text`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Gerenciar Viagem</h2>
          <button onClick={onClose} className="text-brand-subtext hover:text-brand-text"><XCircleIcon className="w-7 h-7" /></button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
            {/* Participants */}
            <div>
                <h3 className="font-semibold mb-3 flex items-center"><UsersIcon className="w-5 h-5 mr-2"/>Viajantes</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {trip.participants.map(p => (
                        <div key={p.email} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                            <div>
                                <span className="font-semibold block text-sm">{p.name}</span>
                                <span className="text-xs text-brand-subtext">{p.email} - {p.permission === 'EDIT' ? 'Pode Editar' : 'Somente Visualizar'}</span>
                            </div>
                            {p.email !== trip.ownerEmail && (
                                <button onClick={() => handleRemoveParticipant(p.email)} title={`Remover ${p.name}`}>
                                    <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-500"/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-700 mt-3 pt-3 space-y-2">
                    <h4 className="text-sm font-semibold">Convidar por e-mail</h4>
                    <input type="email" value={inviteData.email} onChange={e => setInviteData(d => ({ ...d, email: e.target.value }))} placeholder="E-mail do usuário" className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-sm"/>
                    <select value={inviteData.permission} onChange={e => setInviteData(d => ({ ...d, permission: e.target.value as 'EDIT' | 'VIEW_ONLY' }))} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-sm">
                        <option value="VIEW_ONLY">Somente Visualizar</option>
                        <option value="EDIT">Pode Editar</option>
                    </select>
                    {inviteFeedback && (
                        <p className={`text-xs p-2 rounded-md ${inviteFeedback.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {inviteFeedback.message}
                        </p>
                    )}
                    <button onClick={handleInvite} className="w-full p-2 bg-brand-primary rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition">
                        <PlusCircleIcon className="w-5 h-5"/> Convidar
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div>
                <h3 className="font-semibold mb-3 flex items-center"><TagIcon className="w-5 h-5 mr-2"/>Categorias de Gastos</h3>
                <div className="space-y-2">
                    {trip.categories.map(c => (
                        <div key={c.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                            <span>{c.name}</span>
                            <button onClick={() => handleRemoveCategory(c.id)}><TrashIcon className="w-4 h-4 text-red-400"/></button>
                        </div>
                    ))}
                </div>
                 <div className="flex gap-2 mt-3">
                    <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nova categoria" className="flex-grow p-2 bg-gray-800 border border-gray-600 rounded-lg text-sm"/>
                    <button onClick={handleAddCategory} className="p-2 bg-brand-primary rounded-lg"><PlusCircleIcon className="w-5 h-5"/></button>
                </div>
            </div>

            {/* Currency */}
             <div>
                <h3 className="font-semibold mb-3 flex items-center"><GlobeIcon className="w-5 h-5 mr-2"/>Moeda</h3>
                <select value={trip.currency} onChange={e => handleCurrencyChange(e.target.value as Currency)} className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg">
                    <option value="BRL">Real (BRL)</option>
                    <option value="USD">Dólar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                </select>
             </div>
        </div>

        <div className="mt-6 border-t border-gray-700 pt-6">
            <button onClick={onBackToProfile} className="w-full flex items-center justify-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                <ArrowLeftIcon className="w-5 h-5 mr-2"/> Voltar para o Perfil
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;