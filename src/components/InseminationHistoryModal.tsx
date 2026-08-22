import { useState, useEffect } from 'react';
import type { Cow } from '../types/cow';

interface InseminationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cow: Cow | null;
  onUpdateHistory: (cowId: number, updatedHistory: any[]) => void;
}

export function InseminationHistoryModal({ isOpen, onClose, cow, onUpdateHistory }: InseminationHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editBull, setEditBull] = useState('');

  // Função ultra-robusta para encontrar a data
  const getItemDate = (item: any) => {
    if (!item) return '';
    const directMatch = item.lastInseminationDate || item.date || item.inseminationDate || item.dia || item.data;
    if (directMatch) return directMatch;

    const values = Object.values(item);
    for (const val of values) {
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
        return val;
      }
    }
    return '';
  };

  // Função ultra-robusta para encontrar o nome do touro
  const getItemBull = (item: any, fallbackCowBull?: string) => {
    if (!item) return fallbackCowBull || '-';
    
    // Tenta todas as chaves possíveis
    const directMatch = item.bull || item.touro || item.sire || item.reprodutor || item.bullName;
    if (directMatch) return directMatch;

    // Se não achou nas chaves diretas, percorre todas as propriedades do objeto procurando por uma string válida que não seja data
    const values = Object.values(item);
    for (const val of values) {
      if (typeof val === 'string' && val.trim() !== '' && !/^\d{4}-\d{2}-\d{2}/.test(val) && !/^\d+$/.test(val)) {
        return val;
      }
    }

    // Se ainda assim não achar, usa o touro atual da vaca como último recurso
    return fallbackCowBull || '-';
  };

  useEffect(() => {
    if (!cow) return;

    let insHistory = cow.inseminationHistory ? [...cow.inseminationHistory] : [];
    
    // Se o histórico estiver vazio mas a vaca tiver uma IA atual, insere preenchendo o registro
    if (insHistory.length === 0 && cow.lastInseminationDate) {
      insHistory.push({
        lastInseminationDate: cow.lastInseminationDate,
        bull: cow.bull || '',
        inseminationNumber: cow.inseminationNumber || 1,
      });
    }

    // Ordena do mais recente para o mais antigo
    insHistory.sort((a, b) => {
      const dateA = new Date(getItemDate(a)).getTime() || 0;
      const dateB = new Date(getItemDate(b)).getTime() || 0;
      return dateB - dateA;
    });

    setHistory(insHistory);
    setEditingIndex(null);
  }, [cow, isOpen]);

  if (!isOpen || !cow) return null;

  const handleDelete = (indexToDelete: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de Inseminação?')) {
      const updated = history.filter((_, i) => i !== indexToDelete);
      setHistory(updated);
      onUpdateHistory(cow.id, updated);
    }
  };

  const handleStartEdit = (index: number, item: any) => {
    setEditingIndex(index);
    setEditDate(getItemDate(item));
    setEditBull(getItemBull(item, cow.bull));
  };

  const handleSaveEdit = (indexToEdit: number) => {
    const updated = history.map((item, i) => {
      if (i === indexToEdit) {
        return { ...item, lastInseminationDate: editDate, date: editDate, bull: editBull };
      }
      return item;
    });
    
    setHistory(updated);
    onUpdateHistory(cow.id, updated);
    setEditingIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-800">
            Histórico de Inseminações (IA) — <span className="text-emerald-700">{cow.name}</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg font-bold">✕</button>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-600">Lançamentos Registrados ({history.length})</span>
        </div>

        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-xs">Nenhum registro de inseminação encontrado.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {history.map((item, index) => {
              const currentDate = getItemDate(item);
              const currentBull = getItemBull(item, cow.bull);
              
              return (
                <div key={index} className="border rounded p-2.5 bg-gray-50 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-400">#{history.length - index}</span>
                    {editingIndex === index ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="p-1 border rounded text-xs"
                        />
                        <input
                          type="text"
                          value={editBull}
                          onChange={(e) => setEditBull(e.target.value)}
                          placeholder="Touro"
                          className="p-1 border rounded text-xs w-28"
                        />
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-gray-800">
                          Data: {currentDate ? new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'}
                        </span>
                        <span className="ml-3 text-indigo-700 font-medium">Touro: {currentBull}</span>
                      </div>
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
                        <button onClick={() => handleStartEdit(index, item)} className="text-blue-600 hover:underline font-medium">Editar</button>
                        <button onClick={() => handleDelete(index)} className="text-red-600 hover:underline font-medium">Excluir</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
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