import React, { useState, useMemo } from 'react';
import { Trip } from '../types';
import { XCircleIcon, CalendarIcon, MapPinIcon } from './IconComponents';
import PieChart from './PieChart';

const COLORS = ['#00A8FF', '#00E0C7', '#FACC15', '#FF7A00', '#D600FF', '#00FF4C'];
const currencySymbols = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
};

const FinancialSummary: React.FC<{ trip: Trip }> = ({ trip }) => {
    const [selectedTraveler, setSelectedTraveler] = useState<string>('all');
    
    const currencySymbol = currencySymbols[trip.currency];

    const confirmedActivities = useMemo(() => trip.days.flatMap(d => d.activities).filter(a => a.isConfirmed), [trip.days]);

    const expensesByCategory = useMemo(() => {
        let activitiesToConsider = confirmedActivities;
        if (selectedTraveler !== 'all') {
            activitiesToConsider = confirmedActivities.filter(a => a.participants.includes(selectedTraveler));
        }

        // Accumulate costs by category, handling potential undefined realCost and division by zero.
        const data = activitiesToConsider.reduce((acc, activity) => {
            // FIX: The 'realCost' property on an activity can be undefined.
            // We must provide a fallback value (e.g., 0) to ensure arithmetic operations are safe.
            let cost = activity.realCost ?? 0;
            
            if (selectedTraveler !== 'all') {
                const participantCount = activity.participants.length || 1;
                cost = cost / participantCount;
            }
            
            acc[activity.category] = (acc[activity.category] || 0) + cost;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [confirmedActivities, selectedTraveler]);
    
    const totalSpentFiltered = useMemo(() => expensesByCategory.reduce((sum, item) => sum + item.value, 0), [expensesByCategory]);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Resumo de Gastos</h3>
                <select 
                    value={selectedTraveler} 
                    onChange={e => setSelectedTraveler(e.target.value)} 
                    className="px-4 py-2 rounded-lg text-sm bg-gray-700 border border-transparent text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                    <option value="all">Geral</option>
                    {trip.participants.map(p => <option key={p.email} value={p.name}>{p.name}</option>)}
                </select>
            </div>

            {totalSpentFiltered > 0 ? (
                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                    <div className="flex-shrink-0">
                        <PieChart data={expensesByCategory} />
                    </div>
                    <div className="w-full md:w-64">
                        <h4 className="font-semibold mb-3 text-lg">Gastos por Categoria</h4>
                        <ul className="space-y-2">
                            {expensesByCategory.map((item, index) => (
                                <li key={item.name} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-semibold">{currencySymbol} {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </li>
                            ))}
                            <li className="flex items-center justify-between text-base font-bold border-t border-gray-600 pt-2 mt-2">
                                <span>Total</span>
                                <span>{currencySymbol} {totalSpentFiltered.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-brand-subtext">Nenhum gasto confirmado para a seleção atual.</p>
                </div>
            )}
        </div>
    );
};


interface TripSummaryModalProps {
  trip: Trip;
  onClose: () => void;
}

const TripSummaryModal: React.FC<TripSummaryModalProps> = ({ trip, onClose }) => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'financials'>('itinerary');
  const startDate = new Date(trip.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' });
  const endDate = new Date(trip.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' });
  const currencySymbol = currencySymbols[trip.currency];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-light rounded-xl shadow-2xl p-8 m-4 max-w-3xl w-full max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out text-brand-text">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-2">
          <div>
            <h2 className="text-3xl font-bold text-brand-primary">{trip.name}</h2>
            <div className="flex items-center text-sm text-brand-subtext space-x-4 mt-1">
                <span className="flex items-center"><MapPinIcon className="w-4 h-4 mr-1.5" />{trip.destination}</span>
                <span className="flex items-center"><CalendarIcon className="w-4 h-4 mr-1.5" />{startDate} - {endDate}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-brand-subtext hover:text-brand-text">
            <XCircleIcon className="w-8 h-8" />
          </button>
        </div>
        
        <div className="flex border-b border-gray-700">
            <button 
                onClick={() => setActiveTab('itinerary')}
                className={`px-4 py-3 font-semibold transition-colors duration-200 ${activeTab === 'itinerary' ? 'border-b-2 border-brand-primary text-brand-text' : 'text-brand-subtext'}`}
            >
                Roteiro
            </button>
            <button 
                onClick={() => setActiveTab('financials')}
                className={`px-4 py-3 font-semibold transition-colors duration-200 ${activeTab === 'financials' ? 'border-b-2 border-brand-primary text-brand-text' : 'text-brand-subtext'}`}
            >
                Financeiro
            </button>
        </div>

        <div className="overflow-y-auto pr-4 mt-4">
          {activeTab === 'itinerary' && (
            <div className="space-y-6">
                {trip.days.map(day => (
                    <div key={day.date}>
                    <h3 className="text-xl font-semibold mb-3 border-l-4 border-brand-secondary pl-3">
                        Dia {day.dayNumber} - {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' })}
                    </h3>
                    {day.activities.length > 0 ? (
                        <div className="space-y-3 ml-4">
                        {day.activities.map(activity => (
                            <div key={activity.id} className="p-3 bg-gray-800 rounded-lg">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold">{activity.name} ({activity.time})</p>
                                <p className="text-sm font-medium text-brand-subtext">{currencySymbol} {activity.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            {activity.description && <p className="text-sm text-gray-400 mt-1">{activity.description}</p>}
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-brand-subtext ml-4 italic">Nenhuma atividade programada para este dia.</p>
                    )}
                    </div>
                ))}
            </div>
          )}
          {activeTab === 'financials' && <FinancialSummary trip={trip} />}
        </div>
      </div>
    </div>
  );
};

export default TripSummaryModal;