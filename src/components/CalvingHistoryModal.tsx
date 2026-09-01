import { useState, useEffect } from "react";
import type { Cow } from "../types/cow";

interface CalvingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cow: Cow | null;
  onUpdateHistory: (cowId: number, updatedDates: string[]) => void;
  onDeleteCalving?: (cowId: number, dateToDelete?: string) => void;
}

interface CalvingItem {
  date: string;
  offspringCount: number | string;
}

export function CalvingHistoryModal({
  isOpen,
  onClose,
  cow,
  onUpdateHistory,
  onDeleteCalving,
}: CalvingHistoryModalProps) {
  const [calvingRecords, setCalvingRecords] = useState<CalvingItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editDateValue, setEditDateValue] = useState("");
  const [editOffspringValue, setEditOffspringValue] = useState<number>(1);
  const [newDateValue, setNewDateValue] = useState("");
  const [newOffspringValue, setNewOffspringValue] = useState<number>(1);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Sincroniza e extrai as datas e a quantidade de crias associadas
  useEffect(() => {
    if (!cow) return;

    const recordMap = new Map<string, number | string>();

    // 1. Verifica no histórico de inseminação (onde os partos geram registros PEV com a quantidade de crias, se armazenada)
    if (cow.inseminationHistory && cow.inseminationHistory.length > 0) {
      cow.inseminationHistory.forEach((item: any) => {
        const status = item.successStatus || item.status;
        if (item.isCalvingRecord || status === 'PEV') {
          const pevDate = (item.date || item.lastInseminationDate || item.data || "").split('T')[0];
          if (pevDate) {
            recordMap.set(pevDate, item.offspringCount || cow.offspringCount || 1);
          }
        }
      });
    }

    // 2. Fallback para as propriedades atuais da vaca se houver parto atual
    if (cow.currentCalvingDate) {
      const curDate = String(cow.currentCalvingDate).split('T')[0];
      if (!recordMap.has(curDate)) {
        recordMap.set(curDate, cow.offspringCount || 1);
      }
    }

    // 3. Fallback para parto anterior
    if (cow.previousCalvingDate) {
      const prevDate = String(cow.previousCalvingDate).split('T')[0];
      if (!recordMap.has(prevDate)) {
        recordMap.set(prevDate, 1);
      }
    }

    // Converte o Map em array de objetos e ordena do mais recente para o mais antigo
    const records: CalvingItem[] = Array.from(recordMap.entries()).map(([date, offspringCount]) => ({
      date,
      offspringCount,
    }));

    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setCalvingRecords(records);
    setEditingIndex(null);
    setIsAddingNew(false);
  }, [cow, isOpen]);

  if (!isOpen || !cow) return null;

  const handleDelete = (indexToDelete: number) => {
    const dateToDelete = calvingRecords[indexToDelete].date;
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta data do histórico de partos?",
      )
    ) {
      const updatedRecords = calvingRecords.filter((_, i) => i !== indexToDelete);
      setCalvingRecords(updatedRecords); 
      
      const updatedDates = updatedRecords.map(r => r.date);
      onUpdateHistory(cow.id, updatedDates); 
      if (onDeleteCalving) {
        onDeleteCalving(cow.id, dateToDelete);
      }
    }
  };

  const handleStartEdit = (index: number, record: CalvingItem) => {
    setEditingIndex(index);
    setEditDateValue(record.date);
    setEditOffspringValue(Number(record.offspringCount) || 1);
  };

  const handleSaveEdit = (indexToEdit: number) => {
    const updated = calvingRecords.map((item, i) =>
      i === indexToEdit ? { date: editDateValue, offspringCount: editOffspringValue } : item,
    );
    updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setCalvingRecords(updated);
    onUpdateHistory(cow.id, updated.map(r => r.date));
    setEditingIndex(null);
  };

  const handleAddDate = () => {
    if (!newDateValue) return;
    const updated = [{ date: newDateValue, offspringCount: newOffspringValue }, ...calvingRecords];
    updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setCalvingRecords(updated);
    onUpdateHistory(cow.id, updated.map(r => r.date));
    setNewDateValue("");
    setNewOffspringValue(1);
    setIsAddingNew(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-lg font-bold text-gray-800">
            Histórico de Partos —{" "}
            <span className="text-emerald-700">{cow.name}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg font-bold"
          >
            ✕
          </button>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-600">
            Partos Registrados ({calvingRecords.length})
          </span>
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
          <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded border text-xs">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={newDateValue}
                  onChange={(e) => setNewDateValue(e.target.value)}
                  className="w-full p-1.5 border rounded"
                />
              </div>
              <div className="w-24">
                <label className="block font-medium text-gray-700 mb-1">Crias</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newOffspringValue}
                  onChange={(e) => setNewOffspringValue(Number(e.target.value))}
                  className="w-full p-1.5 border rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={handleAddDate}
                className="bg-emerald-700 text-white px-3 py-1 rounded font-bold hover:bg-emerald-800"
              >
                Salvar
              </button>
              <button
                onClick={() => setIsAddingNew(false)}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {calvingRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-xs">
            Nenhum registro de parto encontrado.
          </p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {calvingRecords.map((record, index) => (
              <div
                key={index}
                className="border rounded p-2.5 bg-gray-50 flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-400">
                    #{calvingRecords.length - index}
                  </span>
                  {editingIndex === index ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="date"
                        value={editDateValue}
                        onChange={(e) => setEditDateValue(e.target.value)}
                        className="p-1 border rounded text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editOffspringValue}
                        onChange={(e) => setEditOffspringValue(Number(e.target.value))}
                        className="w-16 p-1 border rounded text-xs"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800">{record.date.split('-').reverse().join('/')}</span>
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {record.offspringCount} {Number(record.offspringCount) === 1 ? 'Cria' : 'Crias'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingIndex === index ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(index)}
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="text-gray-600 hover:underline"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(index, record)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}