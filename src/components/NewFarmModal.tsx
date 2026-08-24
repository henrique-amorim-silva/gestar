import React, { useState } from 'react';

interface NewFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (farmName: string) => void;
}

export const NewFarmModal: React.FC<NewFarmModalProps> = ({ isOpen, onClose, onSave }) => {
  const [farmName, setFarmName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;
    onSave(farmName.trim());
    setFarmName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
        <h3 className="text-base font-bold text-gray-800 mb-4">Cadastrar Nova Fazenda</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nome da Fazenda</label>
            <input
              type="text"
              placeholder="Ex: Fazenda Santa Clara"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              Salvar Fazenda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};