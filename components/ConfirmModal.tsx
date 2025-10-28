import React, { useState, useEffect } from 'react';
import { Activity } from '../types';

interface ConfirmModalProps {
  activity: Activity;
  participants: string[];
  currencySymbol: string;
  onClose: () => void;
  onConfirm: (activityId: string, realCost: number, confirmedParticipants: string[]) => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ activity, participants, currencySymbol, onClose, onConfirm }) => {
  const [usePlannedValue, setUsePlannedValue] = useState(true);
  const [realCost, setRealCost] = useState(activity.estimatedCost.toString());
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(participants);

  const areAllSelected = participants.length > 0 && selectedParticipants.length === participants.length;

  useEffect(() => {
    setRealCost(activity.estimatedCost.toString());
    setSelectedParticipants(participants); // Pre-select all participants
  }, [activity, participants]);

  const handleParticipantChange = (participant: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participant) ? prev.filter(p => p !== participant) : [...prev, participant]
    );
  };
  
  const handleSelectAll = () => {
    if (areAllSelected) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(participants);
    }
  };

  const handleConfirm = () => {
    const cost = usePlannedValue ? activity.estimatedCost : parseFloat(realCost) || 0;
    onConfirm(activity.id, cost, selectedParticipants);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-light rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-all duration-300 ease-out text-brand-text">
        <h2 className="text-2xl font-bold mb-4">Confirmar Atividade</h2>
        <p className="text-brand-subtext mb-6">Você está confirmando: <strong className="text-brand-primary">{activity.name}</strong></p>

        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-sm text-brand-subtext">Valor planejado:</p>
          <p className="text-2xl font-semibold">{currencySymbol} {activity.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="space-y-4 mb-6">
          <label className="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
            <input type="radio" name="cost-option" className="h-5 w-5 text-brand-primary bg-gray-700 border-gray-500 focus:ring-brand-primary" checked={usePlannedValue} onChange={() => setUsePlannedValue(true)} />
            <span className="ml-3">Gastei o valor planejado</span>
          </label>
          <label className="flex items-center p-4 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
            <input type="radio" name="cost-option" className="h-5 w-5 text-brand-primary bg-gray-700 border-gray-500 focus:ring-brand-primary" checked={!usePlannedValue} onChange={() => setUsePlannedValue(false)} />
            <span className="ml-3">Informar outro valor</span>
          </label>
        </div>

        {!usePlannedValue && (
          <div className="mb-6">
            <label htmlFor="realCost" className="block text-sm font-medium mb-1">Valor Real Gasto ({currencySymbol})</label>
            <input type="number" id="realCost" value={realCost} onChange={(e) => setRealCost(e.target.value)} className="mt-1 block w-full border-gray-600 bg-gray-700 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm p-3" placeholder="Ex: 115.50" />
          </div>
        )}

        <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Quem participou?</h3>
                {participants.length > 1 && (
                    <label className="flex items-center text-sm cursor-pointer">
                        <input type="checkbox" checked={areAllSelected} onChange={handleSelectAll} className="h-4 w-4 rounded text-brand-primary bg-gray-600 border-gray-500 focus:ring-brand-primary" />
                        <span className="ml-2">Todos</span>
                    </label>
                )}
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {participants.map(p => (
                    <label key={p} className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={selectedParticipants.includes(p)} onChange={() => handleParticipantChange(p)} className="h-4 w-4 rounded text-brand-primary bg-gray-600 border-gray-500 focus:ring-brand-primary" />
                        <span className="ml-3 text-sm">{p}</span>
                    </label>
                ))}
            </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition">Cancelar</button>
          <button onClick={handleConfirm} className="px-6 py-2 rounded-lg text-white bg-brand-secondary hover:bg-opacity-90 transition font-semibold shadow-md">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;