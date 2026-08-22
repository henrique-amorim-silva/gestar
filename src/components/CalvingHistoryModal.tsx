import { useState, useEffect } from 'react';
import type { Cow } from '../types/cow';

interface CalvingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cow: Cow | null;
  onUpdateHistory: (cowId: number, updatedDates: string[]) => void;
}

export function CalvingHistoryModal({ isOpen, onClose, cow, onUpdateHistory }: CalvingHistoryModalProps) {
  const [calvingDates, setCalvingDates] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDateValue, setEditDateValue] = useState('');
  const [newDateValue, setNewDateValue] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Sincroniza e atualiza a lista sempre que o modal abre ou a vaca muda
  useEffect(() => {
    if (!cow) return;

    let dates: string[] = [];
    
    if (cow.calvingHistory && cow.calvingHistory.length > 0) {
      dates = cow.calvingHistory.map((item: any) => item.currentCalvingDate).filter(Boolean);
      const lastItem = cow.calvingHistory[cow.calvingHistory.length - 1];
      if (lastItem?.previousCalvingDate && !dates.includes(lastItem.previousCalvingDate)) {
        dates.push(lastItem.previousCalvingDate);
      }
    }

    if (dates.length === 0) {
      if (cow.currentCalvingDate) dates.push(cow.currentCalvingDate);
      if (cow.previousCalvingDate && !dates.includes(cow.previousCalvingDate)) {
        dates.push(cow.previousCalvingDate);
      }
    }

    // Ordena da mais recente para a mais antiga
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    setCalvingDates(dates);
    setEditingIndex(null);
    setIsAddingNew(false);
  }, [cow, isOpen]);

  if (!isOpen || !cow) return null;

  const handleDelete = (indexToDelete: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta data do histórico de partos?')) {
      const updated = calvingDates.filter((_, i) => i !== indexToDelete);
      setCalvingDates(updated); // Atualiza na hora na tela
      onUpdateHistory(cow.id, updated); // Atualiza no App principal
    }
  };

  const handleStartEdit = (index: number, dateStr: string) => {
    setEditingIndex(index);
    setEditDateValue(dateStr);
  };

  const handleSaveEdit = (indexToEdit: number) => {
    const updated = calvingDates.map((date, i) => (i === indexToEdit ? editDateValue : date));
    // Reordena para manter sempre do mais recente para o mais antigo
    updated.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    setCalvingDates(updated); // Atualiza na hora na tela
    onUpdateHistory(cow.id, updated); // Atualiza no App principal
    setEditingIndex(null);
  };

  const handleAddDate = () => {
    if (!newDateValue) return;
    const updated = [newDateValue, ...calvingDates];
    updated.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    setCalvingDates(updated); // Atualiza na hora na tela
    onUpdateHistory(cow.id, updated); // Atualiza no App principal
    setNewDateValue('');
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-800">
            Histórico de Partos — <span className="text-emerald-700">{cow.name}</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg font-bold">✕</button>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-600">Partos Registrados ({calvingDates.length})</span>
          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="text-xs bg-emerald-700 text-white px-2.5 py-1 rounded hover:bg-emerald-800 font-medium"
            >
              + Adicionar Parto
            </button>
          )}
        </div>

        {isAddingNew && (
          <div className="flex gap-2 items-center bg-gray-50 p-2.5 rounded border">
            <input
              type="date"
              value={newDateValue}
              onChange={(e) => setNewDateValue(e.target.value)}
              className="w-full p-1 border rounded text-xs"
            />
            <button
              onClick={handleAddDate}
              className="bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold hover:bg-emerald-800"
            >
              Salvar
            </button>
            <button
              onClick={() => setIsAddingNew(false)}
              className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        )}

        {calvingDates.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-xs">Nenhum registro de parto encontrado.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {calvingDates.map((date, index) => (
              <div key={index} className="border rounded p-2.5 bg-gray-50 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-400">#{calvingDates.length - index}</span>
                  {editingIndex === index ? (
                    <input
                      type="date"
                      value={editDateValue}
                      onChange={(e) => setEditDateValue(e.target.value)}
                      className="p-1 border rounded text-xs"
                    />
                  ) : (
                    <span className="font-semibold text-gray-800">{date}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingIndex === index ? (
                    <>
                      <button onClick={() => handleSaveEdit(index)} className="text-emerald-700 font-bold hover:underline">Salvar</button>
                      <button onClick={() => setEditingIndex(null)} className="text-gray-600 hover:underline">Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleStartEdit(index, date)} className="text-blue-600 hover:underline font-medium">Editar</button>
                      <button onClick={() => handleDelete(index)} className="text-red-600 hover:underline font-medium">Excluir</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs font-semibold">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}