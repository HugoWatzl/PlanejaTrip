import React, { useState, useEffect } from 'react';
import { Activity, Category, Participant } from '../types';

interface ActivityFormModalProps {
  activity: Activity | null;
  categories: Category[];
  tripParticipants: Participant[];
  onClose: () => void;
  onSave: (activity: Omit<Activity, 'isConfirmed' | 'realCost'>) => void;
}

const ActivityFormModal: React.FC<ActivityFormModalProps> = ({ activity, categories, tripParticipants, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    time: '12:00',
    description: '',
    estimatedCost: '',
    category: categories[0]?.name || '',
  });
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const areAllSelected = tripParticipants.length > 0 && selectedParticipants.length === tripParticipants.length;

  useEffect(() => {
    if (activity) {
      setFormData({
        id: activity.id,
        name: activity.name,
        time: activity.time,
        description: activity.description || '',
        estimatedCost: activity.estimatedCost.toString(),
        category: activity.category,
      });
      setSelectedParticipants(activity.participants);
    } else {
      setFormData({
        id: '',
        name: '',
        time: '12:00',
        description: '',
        estimatedCost: '',
        category: categories[0]?.name || '',
      });
      setSelectedParticipants(tripParticipants.map(p => p.name));
    }
  }, [activity, categories, tripParticipants]);
  
  const handleParticipantChange = (participantName: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participantName) ? prev.filter(p => p !== participantName) : [...prev, participantName]
    );
  };
  
  const handleSelectAll = () => {
    if (areAllSelected) {
      setSelectedParticipants([]);
    } else {
      setSelectedParticipants(tripParticipants.map(p => p.name));
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.estimatedCost && formData.category) {
      onSave({
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost),
        participants: selectedParticipants,
      });
    }
  };

  const modalTitle = activity ? 'Editar Atividade' : 'Adicionar Atividade';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-light rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-all duration-300 ease-out text-brand-text">
        <h2 className="text-2xl font-bold mb-6">{modalTitle}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-subtext mb-1">Nome da Atividade</label>
            <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="time" className="block text-sm font-medium text-brand-subtext mb-1">Horário</label>
                <input type="time" name="time" id="time" required value={formData.time} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm" />
            </div>
            <div>
                <label htmlFor="estimatedCost" className="block text-sm font-medium text-brand-subtext mb-1">Custo Estimado (R$)</label>
                <input type="number" name="estimatedCost" id="estimatedCost" required value={formData.estimatedCost} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-brand-subtext mb-1">Categoria</label>
            <select name="category" id="category" required value={formData.category} onChange={handleChange} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm">
                <option value="" disabled>Selecione uma categoria</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-brand-subtext mb-1">Descrição (Opcional)</label>
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={2} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm"></textarea>
          </div>
          
           <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-brand-subtext">Participantes</h3>
                {tripParticipants.length > 1 && (
                    <label className="flex items-center text-sm cursor-pointer">
                        <input type="checkbox" checked={areAllSelected} onChange={handleSelectAll} className="h-4 w-4 rounded text-brand-primary bg-gray-600 border-gray-500 focus:ring-brand-primary" />
                        <span className="ml-2">Todos</span>
                    </label>
                )}
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2 bg-gray-800 p-2 rounded-lg">
                {tripParticipants.map(p => (
                    <label key={p.email} className="flex items-center p-2 bg-gray-700 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={selectedParticipants.includes(p.name)} onChange={() => handleParticipantChange(p.name)} className="h-4 w-4 rounded text-brand-primary bg-gray-600 border-gray-500 focus:ring-brand-primary" />
                        <span className="ml-3 text-sm">{p.name}</span>
                    </label>
                ))}
            </div>
        </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition">Cancelar</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-brand-primary hover:bg-opacity-90 transition font-semibold shadow-md">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityFormModal;