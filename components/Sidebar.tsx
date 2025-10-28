import React, { useState, useEffect } from 'react';
import { Trip, Category, Currency, User, TripPreferences } from '../types';
import { UsersIcon, TagIcon, GlobeIcon, PlusCircleIcon, TrashIcon, SparklesIcon } from './IconComponents';

interface SettingsViewProps {
  trip: Trip;
  user: User;
  onUpdateTrip: (updatedTrip: Trip) => void;
  onInvite: (trip: Trip, email: string, permission: 'EDIT' | 'VIEW_ONLY') => string | null;
}

const SettingsView: React.FC<SettingsViewProps> = ({ trip, user, onUpdateTrip, onInvite }) => {
    const [inviteData, setInviteData] = useState({ email: '', permission: 'VIEW_ONLY' as 'EDIT' | 'VIEW_ONLY' });
    const [newCategory, setNewCategory] = useState('');
    const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Local state for textareas to provide a better typing experience
    const [likesInput, setLikesInput] = useState(trip.preferences.likes.join(', '));
    const [dislikesInput, setDislikesInput] = useState(trip.preferences.dislikes.join(', '));

    useEffect(() => {
        setLikesInput(trip.preferences.likes.join(', '));
        setDislikesInput(trip.preferences.dislikes.join(', '));
    }, [trip.preferences]);

    const handleInvite = () => {
        setInviteFeedback(null);
        if (inviteData.email) {
            const result = onInvite(trip, inviteData.email, inviteData.permission);
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

    const handlePermissionChange = (participantEmail: string, newPermission: 'EDIT' | 'VIEW_ONLY') => {
        const updatedParticipants = trip.participants.map(p =>
            p.email === participantEmail ? { ...p, permission: newPermission } : p
        );
        onUpdateTrip({ ...trip, participants: updatedParticipants });
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
    
    const handlePreferencesChange = (field: keyof TripPreferences, value: string) => {
        const newPreferences = { ...trip.preferences };
        if(field === 'likes' || field === 'dislikes') {
            // Split by comma, trim whitespace from each item, and filter out any empty items
            newPreferences[field] = value.split(',').map(item => item.trim()).filter(Boolean);
        } else {
            newPreferences[field] = value as TripPreferences['budgetStyle'];
        }
        onUpdateTrip({ ...trip, preferences: newPreferences });
    };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-brand-text">Configurações da Viagem</h2>

        {/* Preferences */}
        <div className="bg-brand-light p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center"><SparklesIcon className="w-5 h-5 mr-2 text-brand-accent"/>Preferências da Viagem</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-brand-subtext mb-1 block">Estilo da Viagem</label>
                    <select 
                      value={trip.preferences.budgetStyle} 
                      onChange={e => handlePreferencesChange('budgetStyle', e.target.value)} 
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                    >
                        <option value="economico">Econômico</option>
                        <option value="confortavel">Confortável</option>
                        <option value="luxo">Luxo</option>
                        <option value="exclusivo">Exclusivo</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium text-brand-subtext mb-1 block">Gostos (itens separados por vírgula)</label>
                    <textarea 
                        value={likesInput} 
                        onChange={e => setLikesInput(e.target.value)}
                        onBlur={() => handlePreferencesChange('likes', likesInput)}
                        placeholder="Ex: museus, comida local, parques"
                        rows={2}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-brand-subtext mb-1 block">Não Gostos (itens separados por vírgula)</label>
                    <textarea 
                        value={dislikesInput} 
                        onChange={e => setDislikesInput(e.target.value)}
                        onBlur={() => handlePreferencesChange('dislikes', dislikesInput)}
                        placeholder="Ex: baladas, lugares muito cheios"
                        rows={2}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                    />
                </div>
            </div>
        </div>

        {/* Participants */}
        <div className="bg-brand-light p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center"><UsersIcon className="w-5 h-5 mr-2"/>Viajantes</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-4">
                {trip.participants.map(p => (
                    <div key={p.email} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                        <div>
                            <span className="font-semibold block text-sm">{p.name}</span>
                            <span className="text-xs text-brand-subtext">{p.email}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            {p.email === trip.ownerEmail ? (
                                <span className="text-xs bg-brand-primary/50 text-brand-primary px-2 py-1 rounded font-bold">Dono</span>
                            ) : trip.ownerEmail === user.email ? (
                                <>
                                    <select
                                        value={p.permission}
                                        onChange={(e) => handlePermissionChange(p.email, e.target.value as 'EDIT' | 'VIEW_ONLY')}
                                        className="bg-gray-800 text-xs rounded border border-gray-600 p-1 focus:ring-brand-primary focus:border-brand-primary"
                                    >
                                        <option value="EDIT">Pode Editar</option>
                                        <option value="VIEW_ONLY">Somente Visualizar</option>
                                    </select>
                                    <button onClick={() => handleRemoveParticipant(p.email)} title={`Remover ${p.name}`}>
                                        <TrashIcon className="w-4 h-4 text-red-400 hover:text-red-500"/>
                                    </button>
                                </>
                            ) : (
                                <span className="text-xs bg-gray-800 px-2 py-1 rounded font-medium">
                                    {p.permission === 'EDIT' ? 'Pode Editar' : 'Somente Visualizar'}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {trip.ownerEmail === user.email && (
                <div className="border-t border-gray-700 pt-4 space-y-2">
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
            )}
        </div>

        {/* Categories */}
        <div className="bg-brand-light p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center"><TagIcon className="w-5 h-5 mr-2"/>Categorias de Gastos</h3>
            <div className="space-y-2 mb-3">
                {trip.categories.map(c => (
                    <div key={c.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                        <span className="text-sm">{c.name}</span>
                        <button onClick={() => handleRemoveCategory(c.id)}><TrashIcon className="w-4 h-4 text-red-400 hover:text-red-500"/></button>
                    </div>
                ))}
            </div>
             <div className="flex gap-2 border-t border-gray-700 pt-4">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nova categoria" className="flex-grow p-2 bg-gray-800 border border-gray-600 rounded-lg text-sm"/>
                <button onClick={handleAddCategory} className="p-2 bg-brand-primary rounded-lg"><PlusCircleIcon className="w-5 h-5"/></button>
            </div>
        </div>

        {/* Currency */}
        <div className="bg-brand-light p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4 flex items-center"><GlobeIcon className="w-5 h-5 mr-2"/>Moeda</h3>
            <select value={trip.currency} onChange={e => handleCurrencyChange(e.target.value as Currency)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg">
                <option value="BRL">Real (BRL)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
            </select>
        </div>
    </div>
  );
};

export default SettingsView;