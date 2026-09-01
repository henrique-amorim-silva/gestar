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

  const getItemDate = (item: any) => {
    if (!item) return '';
    const dateVal = item.date || item.lastInseminationDate || item.inseminationDate || item.data || item.dia;
    if (dateVal && typeof dateVal === 'string') return dateVal.split('T')[0];
    return '';
  };

  const getItemBull = (item: any, fallbackCowBull?: string) => {
    if (!item) return fallbackCowBull || '-';
    
    // Adicionado 'PEV' à lista de valores inválidos para o nome do touro
    const invalidValues = ['Prenhe / Sucesso', 'Vazia / Falha', 'Pendente', 'DG+', 'DG-', 'PEV', 'Pendente / Sem Diagnóstico'];
    
    const directMatch = item.bull || item.touro || item.sire || item.reprodutor || item.bullName;
    if (directMatch && !invalidValues.includes(directMatch)) {
      return directMatch;
    }

    return fallbackCowBull || '-';
  };

  const getItemSuccess = (item: any) => {
    if (item.successStatus !== undefined) return item.successStatus;
    if (item.isSuccessful === true) return 'Prenhe / Sucesso';
    if (item.isSuccessful === false) return 'Vazia / Falha';
    return 'Pendente';
  };

  useEffect(() => {
    if (!cow) return;

    let insHistory = cow.inseminationHistory ? [...cow.inseminationHistory] : [];
    
    if (insHistory.length === 0 && cow.lastInseminationDate) {
      insHistory.push({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        date: cow.lastInseminationDate,
        lastInseminationDate: cow.lastInseminationDate,
        bull: cow.bull || '',
        inseminationNumber: cow.inseminationNumber || 1,
        successStatus: 'Pendente',
      });
    } else {
      insHistory = insHistory.map((item, idx) => {
        const resolvedDate = getItemDate(item) || cow.lastInseminationDate || '';
        return {
          ...item,
          id: item.id || `ins-${idx}-${Date.now()}`,
          date: resolvedDate,
          lastInseminationDate: resolvedDate,
          bull: getItemBull(item, cow.bull),
          successStatus: getItemSuccess(item)
        };
      });
    }

    insHistory.sort((a, b) => {
      const dateA = new Date(getItemDate(a)).getTime() || 0;
      const dateB = new Date(getItemDate(b)).getTime() || 0;
      return dateB - dateA;
    });

    setHistory(insHistory);
    setEditingIndex(null);
  }, [cow, isOpen]);

  if (!isOpen || !cow) return null;

  const saveAndSync = (updatedHistory: any[]) => {
    setHistory(updatedHistory);

    if (updatedHistory.length > 0) {
      const latest = updatedHistory[0];
      const latestDate = getItemDate(latest);
      cow.lastInseminationDate = latestDate;
      cow.bull = getItemBull(latest, cow.bull);
    } else {
      cow.lastInseminationDate = '';
      cow.bull = '';
      cow.inseminationNumber = 0;
      
      if ('firstInseminationDate' in cow) (cow as any).firstInseminationDate = '';
      if ('firstHeatDate' in cow) (cow as any).firstHeatDate = '';
      if ('cioDate' in cow) (cow as any).cioDate = '';
    }

    onUpdateHistory(cow.id, updatedHistory);
  };

  const handleDelete = (indexToDelete: number) => {
    if (window.confirm('Tem certeza que deseja excluir este registro de Inseminação?')) {
      const updated = history.filter((_, i) => i !== indexToDelete);
      saveAndSync(updated);
    }
  };

  const handleToggleStatus = (indexToToggle: number) => {
    const updated = history.map((item, i) => {
      if (i === indexToToggle) {
        const currentFullStatus = getItemSuccess(item);
        
        // Ciclo de alternância atualizado incluindo o PEV:
        // Pendente ➔ DG+ (Prenhe / Sucesso) ➔ DG- (Vazia / Falha) ➔ PEV ➔ Pendente
        let nextFullStatus = 'Pendente';
        if (currentFullStatus === 'Pendente' || currentFullStatus === 'Pendente / Sem Diagnóstico') {
          nextFullStatus = 'Prenhe / Sucesso';
        } else if (currentFullStatus === 'Prenhe / Sucesso') {
          nextFullStatus = 'Vazia / Falha';
        } else if (currentFullStatus === 'Vazia / Falha') {
          nextFullStatus = 'PEV';
        } else {
          nextFullStatus = 'Pendente';
        }

        return {
          ...item,
          successStatus: nextFullStatus
        };
      }
      return item;
    });

    saveAndSync(updated);
  };

  const handleStartEdit = (index: number, item: any) => {
    setEditingIndex(index);
    setEditDate(getItemDate(item));
    setEditBull(getItemBull(item, cow.bull));
  };

  const handleSaveEdit = (indexToEdit: number) => {
    const updated = history.map((item, i) => {
      if (i === indexToEdit) {
        return { 
          ...item, 
          date: editDate,
          lastInseminationDate: editDate, 
          bull: editBull
        };
      }
      return item;
    });
    
    saveAndSync(updated);
    setEditingIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl space-y-4 shadow-xl">
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
              const fullStatus = getItemSuccess(item);
              
              let displayStatus = 'Pendente';
              let badgeColor = 'bg-amber-100 text-amber-800 hover:bg-amber-200';
              
              if (fullStatus === 'Prenhe / Sucesso') {
                displayStatus = 'DG+';
                badgeColor = 'bg-green-100 text-green-800 hover:bg-green-200';
              } else if (fullStatus === 'Vazia / Falha') {
                displayStatus = 'DG-';
                badgeColor = 'bg-red-100 text-red-800 hover:bg-red-200';
              } else if (fullStatus === 'PEV') {
                displayStatus = 'PEV';
                badgeColor = 'bg-purple-100 text-purple-800 hover:bg-purple-200';
              }
              
              return (
                <div key={item.id || index} className="border rounded p-2.5 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="font-bold text-gray-400">#{history.length - index}</span>
                    {editingIndex === index ? (
                      <div className="flex flex-wrap gap-2 items-center">
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
                          className="p-1 border rounded text-xs w-24"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className="font-semibold text-gray-800">
                          Data: {currentDate ? new Date(currentDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informada'}
                        </span>
                        <span className="text-indigo-700 font-medium">Touro: {currentBull}</span>
                        
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(index)}
                          title="Clique para alternar o status (Pendente ➔ DG+ ➔ DG- ➔ PEV)"
                          className={`px-2 py-0.5 rounded font-bold text-[10px] transition-colors cursor-pointer shadow-sm ${badgeColor}`}
                        >
                          {displayStatus}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 self-end sm:self-center">
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