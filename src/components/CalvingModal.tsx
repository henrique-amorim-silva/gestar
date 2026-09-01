import React, { useState, useEffect } from 'react';
import type { Cow } from '../types/cow';

interface CalvingModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Atualizado para receber também a quantidade de crias
  onSave: (cowId: number, newCalvingDate: string, offspringCount: number) => void;
  cow: Cow | null;
}

export const CalvingModal: React.FC<CalvingModalProps> = ({ isOpen, onClose, onSave, cow }) => {
  const [calvingDate, setCalvingDate] = useState(new Date().toISOString().split('T')[0]);
  const [offspringCount, setOffspringCount] = useState<number>(1); // Novo estado para quantidade de crias (padrão 1)
  const [error, setError] = useState('');

  useEffect(() => {
    if (cow) {
      setCalvingDate(new Date().toISOString().split('T')[0]);
      setOffspringCount(1);
      setError('');
    }
  }, [cow, isOpen]);

  if (!isOpen || !cow) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cow.currentCalvingDate && calvingDate < cow.currentCalvingDate) {
      setError(`A data do novo parto não pode ser anterior ao parto atual (${cow.currentCalvingDate.split('-').reverse().join('/')}).`);
      return;
    }

    onSave(cow.id, calvingDate, offspringCount); // Envia a quantidade de crias
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">
          Lançar Novo Parto
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Matriz: <span className="font-bold text-emerald-800">{cow.name}</span> (Brinco: {cow.numberTag})
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-300">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block font-medium text-gray-700">Data do Novo Parto</label>
            <input
              type="date"
              className="mt-1 w-full border rounded p-2"
              value={calvingDate}
              onChange={e => setCalvingDate(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Parto Atual Anterior: {cow.currentCalvingDate ? cow.currentCalvingDate.split('-').reverse().join('/') : 'Nenhum'}
            </p>
          </div>

          {/* Novo campo para Quantidade de Crias */}
          <div>
            <label className="block font-medium text-gray-700">Quantidade de Crias</label>
            <input
              type="number"
              min="1"
              max="5"
              className="mt-1 w-full border rounded p-2"
              value={offspringCount}
              onChange={e => setOffspringCount(Number(e.target.value))}
              required
            />
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
              Salvar Parto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};