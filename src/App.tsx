import { useState, useEffect } from 'react';
import { INITIAL_COWS } from './data/initialCows';
import { CowTable } from './components/CowTable';
import { CowForm } from './components/CowForm';
import { InseminationModal } from './components/InseminationModal';
import type { Cow } from './types/cow';
import { calculateReproductionFields } from './utils/reproductionCalculations';

export function App() {
  const [cows, setCows] = useState<Cow[]>(() => {
    const saved = localStorage.getItem('@gestar_cows');
    let cowsData = INITIAL_COWS;
    
    if (saved) {
      try {
        cowsData = JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar localStorage", e);
      }
    }

    // Garante que todas as vacas carregadas tenham os campos recalculados com a data atual
    return cowsData.map(cow => {
      const calculated = calculateReproductionFields({
        currentCalvingDate: cow.currentCalvingDate,
        previousCalvingDate: cow.previousCalvingDate,
        lastInseminationDate: cow.lastInseminationDate,
        inseminationNumber: cow.inseminationNumber
      });
      return {
        ...cow,
        ...calculated,
        heatsCount: cow.inseminationNumber
      };
    });
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cowToEdit, setCowToEdit] = useState<Cow | null>(null);

  const [isInsemModalOpen, setIsInsemModalOpen] = useState(false);
  const [cowToInseminate, setCowToInseminate] = useState<Cow | null>(null);

  useEffect(() => {
    localStorage.setItem('@gestar_cows', JSON.stringify(cows));
  }, [cows]);

  const handleSaveCow = (cowData: Omit<Cow, 'id' | 'order'>) => {
    if (cowToEdit) {
      setCows(cows.map(cow => cow.id === cowToEdit.id ? { ...cowData, id: cow.id, order: cow.order, inseminationHistory: cow.inseminationHistory } : cow));
      setCowToEdit(null);
    } else {
      const nextOrder = cows.length > 0 ? Math.max(...cows.map(c => c.order)) + 1 : 1;
      const newCow: Cow = {
        ...cowData,
        id: Date.now(),
        order: nextOrder,
        inseminationHistory: []
      };
      setCows([...cows, newCow]);
    }
  };

  const handleSaveInsemination = (cowId: number, insemData: { lastInseminationDate: string; bull: string; incrementInseminationNumber: boolean }) => {
    setCows(cows.map(cow => {
      if (cow.id === cowId) {
        const previousState = {
          lastInseminationDate: cow.lastInseminationDate,
          bull: cow.bull,
          inseminationNumber: cow.inseminationNumber,
          firstInseminationDate: cow.firstInseminationDate
        };

        const history = cow.inseminationHistory || [];
        const newInsemNumber = insemData.incrementInseminationNumber ? cow.inseminationNumber + 1 : cow.inseminationNumber;
        
        const calculated = calculateReproductionFields({
          currentCalvingDate: cow.currentCalvingDate,
          previousCalvingDate: cow.previousCalvingDate,
          lastInseminationDate: insemData.lastInseminationDate,
          inseminationNumber: newInsemNumber
        });

        return {
          ...cow,
          lastInseminationDate: insemData.lastInseminationDate,
          bull: insemData.bull,
          inseminationNumber: newInsemNumber,
          ...calculated,
          inseminationHistory: [previousState, ...history]
        };
      }
      return cow;
    }));
  };

  const handleUndoInsemination = (cowId: number) => {
    setCows(cows.map(cow => {
      if (cow.id === cowId) {
        const history = cow.inseminationHistory || [];
        if (history.length === 0) {
          alert("Não há lançamentos anteriores de IA para desfazer nesta vaca.");
          return cow;
        }

        const lastState = history[0];
        const remainingHistory = history.slice(1);

        const calculated = calculateReproductionFields({
          currentCalvingDate: cow.currentCalvingDate,
          previousCalvingDate: cow.previousCalvingDate,
          lastInseminationDate: lastState.lastInseminationDate,
          inseminationNumber: lastState.inseminationNumber
        });

        return {
          ...cow,
          lastInseminationDate: lastState.lastInseminationDate,
          bull: lastState.bull,
          inseminationNumber: lastState.inseminationNumber,
          ...calculated,
          inseminationHistory: remainingHistory
        };
      }
      return cow;
    }));
  };

  const handleOpenCreateModal = () => {
    setCowToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditCow = (cow: Cow) => {
    setCowToEdit(cow);
    setIsModalOpen(true);
  };

  const handleDeleteCow = (id: number) => {
    const updatedCows = cows
      .filter(cow => cow.id !== id)
      .map((cow, index) => ({ ...cow, order: index + 1 }));
    
    setCows(updatedCows);
  };

  const handleOpenInseminationModal = (cow: Cow) => {
    setCowToInseminate(cow);
    setIsInsemModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Cabeçalho do Sistema */}
        <header className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-emerald-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
              Controle Reprodutivo de Vacas
            </h1>
            <p className="text-sm text-gray-500">
              Sistema de gestão de inseminação artificial e reprodução do rebanho.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-lg text-sm font-semibold">
              Total de Matrizes: {cows.length}
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors text-sm"
            >
              + Nova Vaca
            </button>
          </div>
        </header>

        {/* Tabela de Registros */}
        <main>
          <CowTable 
            cows={cows} 
            onEdit={handleEditCow} 
            onDelete={handleDeleteCow}
            onInsemination={handleOpenInseminationModal}
            onUndoInsemination={handleUndoInsemination}
          />
        </main>

        {/* Modal de Cadastro / Edição */}
        <CowForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCowToEdit(null);
          }}
          onSave={handleSaveCow}
          cowToEdit={cowToEdit}
        />

        {/* Modal de Lançamento de IA */}
        <InseminationModal
          isOpen={isInsemModalOpen}
          onClose={() => {
            setIsInsemModalOpen(false);
            setCowToInseminate(null);
          }}
          onSave={handleSaveInsemination}
          cow={cowToInseminate}
        />
      </div>
    </div>
  );
}

export default App;