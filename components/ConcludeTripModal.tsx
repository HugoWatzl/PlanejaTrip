import React from 'react';

interface ConcludeTripModalProps {
  tripName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConcludeTripModal: React.FC<ConcludeTripModalProps> = ({ tripName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-brand-light rounded-xl shadow-2xl p-8 m-4 max-w-lg w-full transform transition-all duration-300 ease-out text-brand-text">
        <h2 className="text-2xl font-bold mb-4">Concluir Viagem</h2>
        <p className="text-brand-subtext mb-6">
          Você tem certeza que deseja concluir a viagem <strong className="text-brand-primary">{tripName}</strong>?
        </p>
        <div className="bg-yellow-900/40 border border-yellow-600/50 text-yellow-300 text-sm p-4 rounded-lg mb-8">
            <p className="font-bold mb-2">Atenção: Esta ação não pode ser desfeita.</p>
            <p>A viagem será movida para a seção "Viagens Realizadas" e não poderá mais ser editada. Todos os dados, como roteiro e finanças, serão mantidos para consulta.</p>
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={onCancel} className="px-6 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition font-semibold">Cancelar</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 transition font-bold shadow-md">Sim, Concluir</button>
        </div>
      </div>
    </div>
  );
};

export default ConcludeTripModal;