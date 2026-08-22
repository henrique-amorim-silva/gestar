import { useState, useEffect } from 'react';
import { INITIAL_COWS } from './data/initialCows';
import { CowTable } from './components/CowTable';
import { CowForm } from './components/CowForm';
import type { Cow } from './types/cow';

export function App() {
  const [cows, setCows] = useState<Cow[]>(() => {
    const saved = localStorage.getItem('@gestar_cows');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar localStorage", e);
      }
    }
    return INITIAL_COWS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cowToEdit, setCowToEdit] = useState<Cow | null>(null);

  useEffect(() => {
    localStorage.setItem('@gestar_cows', JSON.stringify(cows));
  }, [cows]);

  const handleSaveCow = (cowData: Omit<Cow, 'id'>) => {
    if (cowToEdit) {
      // Editando vaca existente
      setCows(cows.map(cow => cow.id === cowToEdit.id ? { ...cowData, id: cow.id } : cow));
      setCowToEdit(null);
    } else {
      // Criando nova vaca
      const newCow: Cow = {
        ...cowData,
        id: Date.now(),
      };
      setCows([newCow, ...cows]);
    }
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
    setCows(cows.filter(cow => cow.id !== id));
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
      </div>
    </div>
  );
}

export default App;