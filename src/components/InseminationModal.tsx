import React, { useState, useEffect } from 'react';
import type { Cow } from '../types/cow';

interface InseminationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cowId: number, insemData: { lastInseminationDate: string; bull: string; incrementInseminationNumber: boolean }) => void;
  cow: Cow | null;
}

export const InseminationModal: React.FC<InseminationModalProps> = ({ isOpen, onClose, onSave, cow }) => {
  const [lastInseminationDate, setLastInseminationDate] = useState(new Date().toISOString().split('T')[0]);
  const [bull, setBull] = useState('');
  const [incrementInseminationNumber, setIncrementInseminationNumber] = useState(true);

  useEffect(() => {
    if (cow) {
      setBull(cow.bull || '');
      setLastInseminationDate(new Date().toISOString().split('T')[0]);
      setIncrementInseminationNumber(true);
    }
  }, [cow, isOpen]);

  if (!isOpen || !cow) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cow.id, {
      lastInseminationDate,
      bull: bull.toUpperCase(),
      incrementInseminationNumber
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">
          Lançar Inseminação (IA)
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Matriz: <span className="font-bold text-emerald-800">{cow.name}</span> (Brinco: {cow.numberTag})
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700">Data da Inseminação (Últ. IA)</label>
            <input
              type="date"
              className="mt-1 w-full border rounded p-2"
              value={lastInseminationDate}
              onChange={e => setLastInseminationDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Touro / Sêmen Utilizado</label>
            <input
              type="text"
              className="mt-1 w-full border rounded p-2"
              value={bull}
              onChange={e => setBull(e.target.value)}
              placeholder="Ex: JACK DANIELS"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="incInsem"
              checked={incrementInseminationNumber}
              onChange={e => setIncrementInseminationNumber(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="incInsem" className="text-gray-700 select-none">
              Incrementar Número de IA (Atual: {cow.inseminationNumber} ➔ {cow.inseminationNumber + 1})
            </label>
          </div>

          <div className="flex justify-end gap-2 mt-6 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 font-medium"
            >
              Salvar IA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};