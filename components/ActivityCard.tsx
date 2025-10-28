import React from 'react';
import { Activity } from '../types';
import { TrashIcon, CheckCircleIcon, UsersIcon, TagIcon, PencilIcon } from './IconComponents';

interface ActivityCardProps {
  activity: Activity;
  canEdit: boolean;
  currencySymbol: string;
  onDelete: () => void;
  onConfirmClick: () => void;
  onEdit: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, canEdit, currencySymbol, onDelete, onConfirmClick, onEdit }) => {
  return (
    <div className={`p-4 rounded-lg shadow-md transition-all duration-300 flex flex-col justify-between ${activity.isConfirmed ? 'bg-green-900/50 border-l-4 border-green-500' : 'bg-brand-light'}`}>
      <div>
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-brand-text flex-1 pr-2">{activity.name}</h4>
          <span className="text-sm font-semibold text-brand-primary bg-blue-900/50 px-2 py-1 rounded-full whitespace-nowrap">{activity.time}</span>
        </div>
        <div className="flex items-center text-brand-subtext text-xs mt-2">
            <TagIcon className="w-4 h-4 mr-1.5"/>
            <span>{activity.category}</span>
        </div>
        {activity.description && <p className="text-sm text-brand-subtext mt-2">{activity.description}</p>}
      </div>
      <div className="mt-4">
        {activity.isConfirmed && activity.participants.length > 0 && (
            <div className="flex items-center text-xs text-brand-subtext mb-3" title={activity.participants.join(', ')}>
                <UsersIcon className="w-4 h-4 mr-1.5"/>
                <span>{activity.participants.length} participante(s)</span>
            </div>
        )}
        <div className="flex justify-between items-end">
            <div>
                <p className="text-xs text-brand-subtext">Estimado</p>
                <p className="font-semibold">{currencySymbol} {activity.estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                {activity.isConfirmed && typeof activity.realCost === 'number' && (
                    <div className="mt-1">
                    <p className="text-xs text-green-400">Confirmado</p>
                    <p className="font-bold text-green-400">{currencySymbol} {activity.realCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                )}
            </div>
            {canEdit && (
                <div className="flex items-center space-x-1">
                    <button onClick={onEdit} className="p-2 rounded-full text-brand-subtext hover:text-brand-text hover:bg-gray-700 transition-colors" title="Editar Atividade">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    {!activity.isConfirmed && (
                        <button onClick={onConfirmClick} className="p-2 rounded-full text-brand-secondary hover:bg-green-900/50 transition-colors" title="Confirmar Gasto">
                        <CheckCircleIcon className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={onDelete} className="p-2 rounded-full text-red-400 hover:text-red-500 hover:bg-red-900/50 transition-colors" title="Excluir Atividade">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;