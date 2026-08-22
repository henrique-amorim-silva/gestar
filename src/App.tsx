import { useState, useEffect } from "react";
import { INITIAL_COWS } from "./data/initialCows";
import { CowTable } from "./components/CowTable";
import { CowForm } from "./components/CowForm";
import { InseminationModal } from "./components/InseminationModal";
import { CalvingModal } from "./components/CalvingModal";
import { CalvingHistoryModal } from "./components/CalvingHistoryModal";
import { InseminationHistoryModal } from "./components/InseminationHistoryModal";
import { DashboardKPIs } from "./components/DashboardKPIs"; // <--- Importação dos KPIs
import type { Cow } from "./types/cow";
import { calculateReproductionFields } from "./utils/reproductionCalculations";

export function App() {
  const [cows, setCows] = useState<Cow[]>(() => {
    const saved = localStorage.getItem("@gestar_cows");
    if (saved) {
      const parsedCows: Cow[] = JSON.parse(saved);
      return parsedCows.map((cow) => {
        const calculated = calculateReproductionFields({
          currentCalvingDate: cow.currentCalvingDate,
          previousCalvingDate: cow.previousCalvingDate,
          lastInseminationDate: cow.lastInseminationDate,
          firstInseminationDate: cow.firstInseminationDate,
          firstHeatDate: cow.firstHeatDate,
          inseminationNumber: cow.inseminationNumber,
        });
        return {
          ...cow,
          ...calculated,
        };
      });
    }
    return INITIAL_COWS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cowToEdit, setCowToEdit] = useState<Cow | null>(null);
  const [isInsemModalOpen, setIsInsemModalOpen] = useState(false);
  const [cowToInseminate, setCowToInseminate] = useState<Cow | null>(null);
  const [isCalvingModalOpen, setIsCalvingModalOpen] = useState(false);
  const [cowToCalve, setCowToCalve] = useState<Cow | null>(null);
  
  const [isCalvingHistoryModalOpen, setIsCalvingHistoryModalOpen] = useState(false);
  const [cowForCalvingHistory, setCowForCalvingHistory] = useState<Cow | null>(null);

  const [isInseminationHistoryModalOpen, setIsInseminationHistoryModalOpen] = useState(false);
  const [cowForInseminationHistory, setCowForInseminationHistory] = useState<Cow | null>(null);

  useEffect(() => {
    localStorage.setItem("@gestar_cows", JSON.stringify(cows));
  }, [cows]);

  const handleSaveCow = (cowData: any) => {
    const trimmedTag = (cowData.numberTag || "").trim();

    if (trimmedTag) {
      const duplicateCow = cows.find(
        (c) => c.numberTag.trim().toLowerCase() === trimmedTag.toLowerCase() && (!cowToEdit || c.id !== cowToEdit.id)
      );

      if (duplicateCow) {
        alert(`Erro: Já existe uma vaca cadastrada com o número de brinco "${trimmedTag}" (${duplicateCow.name}).`);
        return;
      }
    }

    if (cowToEdit) {
      const updatedCow: Cow = {
        ...cowToEdit,
        ...cowData,
        firstHeatDate: cowData.firstHeatDate || "",
        firstInseminationDate: cowData.firstInseminationDate || "",
        previousCalvingDate: cowData.previousCalvingDate || "",
        currentCalvingDate: cowData.currentCalvingDate || "",
        lastInseminationDate: cowData.lastInseminationDate || "",
        lastHeatDate: cowData.lastHeatDate || "",
        numberTag: cowData.numberTag || "",
        categoryGS: cowData.categoryGS || "",
        bull: cowData.bull || "",
        dryingDate: cowData.dryingDate || "",
        observations: cowData.observations || "",
      };
      setCows(cows.map((cow) => (cow.id === cowToEdit.id ? updatedCow : cow)));
      setCowToEdit(null);
    } else {
      const nextOrder =
        cows.length > 0 ? Math.max(...cows.map((c) => c.order)) + 1 : 1;
      const newCow: Cow = {
        ...cowData,
        id: Date.now(),
        order: nextOrder,
        numberTag: cowData.numberTag || "",
        categoryGS: cowData.categoryGS || "",
        firstHeatDate: cowData.firstHeatDate || "",
        firstInseminationDate: cowData.firstInseminationDate || "",
        previousCalvingDate: cowData.previousCalvingDate || "",
        currentCalvingDate: cowData.currentCalvingDate || "",
        lastInseminationDate: cowData.lastInseminationDate || "",
        lastHeatDate: cowData.lastHeatDate || "",
        bull: cowData.bull || "",
        dryingDate: cowData.dryingDate || "",
        observations: cowData.observations || "",
        inseminationHistory: [],
        calvingHistory: [],
      };
      setCows([...cows, newCow]);
    }
  };

  const handleSaveCalving = (cowId: number, newCalvingDate: string) => {
    setCows(
      cows.map((cow) => {
        if (cow.id === cowId) {
          const previousState = {
            currentCalvingDate: cow.currentCalvingDate,
            previousCalvingDate: cow.previousCalvingDate,
          };

          const updatedPreviousCalving = cow.currentCalvingDate || cow.previousCalvingDate;
          const updatedCurrentCalving = newCalvingDate;

          const calculated = calculateReproductionFields({
            currentCalvingDate: updatedCurrentCalving,
            previousCalvingDate: updatedPreviousCalving,
            lastInseminationDate: cow.lastInseminationDate,
            firstInseminationDate: cow.firstInseminationDate,
            firstHeatDate: cow.firstHeatDate,
            inseminationNumber: cow.inseminationNumber,
          });

          return {
            ...cow,
            ...calculated,
            currentCalvingDate: updatedCurrentCalving,
            previousCalvingDate: updatedPreviousCalving,
            calvingHistory: [
              previousState,
              ...(cow.calvingHistory || []),
            ],
          };
        }
        return cow;
      })
    );
  };

 const handleUpdateCalvingHistory = (cowId: number, updatedDates: string[]) => {
    const sortedDates = [...updatedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const newCurrentCalving = sortedDates[0] || "";
    const newPreviousCalving = sortedDates[1] || "";

    setCows(
      cows.map((cow) => {
        if (cow.id === cowId) {
          const restructuredHistory = [];
          for (let i = 0; i < sortedDates.length - 1; i++) {
            restructuredHistory.push({
              currentCalvingDate: sortedDates[i],
              previousCalvingDate: sortedDates[i + 1],
            });
          }

          const calculated = calculateReproductionFields({
            currentCalvingDate: newCurrentCalving,
            previousCalvingDate: newPreviousCalving,
            lastInseminationDate: cow.lastInseminationDate,
            firstInseminationDate: cow.firstInseminationDate,
            firstHeatDate: cow.firstHeatDate,
            inseminationNumber: cow.inseminationNumber,
          });

          return {
            ...cow,
            ...calculated,
            currentCalvingDate: newCurrentCalving,
            previousCalvingDate: newPreviousCalving,
            calvingHistory: restructuredHistory,
          };
        }
        return cow;
      })
    );
  };

  const handleSaveInsemination = (
    cowId: number,
    insemData: {
      lastInseminationDate: string;
      bull: string;
      incrementInseminationNumber: boolean;
    },
  ) => {
    setCows(
      cows.map((cow) => {
        if (cow.id === cowId) {
          const previousState = {
            lastInseminationDate: cow.lastInseminationDate,
            bull: cow.bull,
            inseminationNumber: cow.inseminationNumber,
            firstInseminationDate: cow.firstInseminationDate,
            firstHeatDate: cow.firstHeatDate,
          };

          const newInsemNumber = insemData.incrementInseminationNumber
            ? cow.inseminationNumber + 1
            : cow.inseminationNumber || 1;

          let newCategoryGS = cow.categoryGS;
          if (newInsemNumber === 0) newCategoryGS = "Nulípara";
          else if (newInsemNumber === 1) newCategoryGS = "Primípara";
          else if (newInsemNumber > 1) newCategoryGS = "Multípara";

          const firstInseminationDate = cow.firstInseminationDate || insemData.lastInseminationDate;
          const firstHeatDate = cow.firstHeatDate || insemData.lastInseminationDate;

          const calculated = calculateReproductionFields({
            currentCalvingDate: cow.currentCalvingDate,
            previousCalvingDate: cow.previousCalvingDate,
            lastInseminationDate: insemData.lastInseminationDate,
            firstInseminationDate: firstInseminationDate,
            firstHeatDate: firstHeatDate,
            inseminationNumber: newInsemNumber,
          });

          return {
            ...cow,
            ...calculated,
            lastInseminationDate: insemData.lastInseminationDate,
            bull: insemData.bull,
            inseminationNumber: newInsemNumber,
            categoryGS: newCategoryGS,
            firstInseminationDate,
            firstHeatDate,
            inseminationHistory: [
              previousState,
              ...(cow.inseminationHistory || []),
            ],
          };
        }
        return cow;
      }),
    );
  };

  const handleUpdateInseminationHistory = (cowId: number, updatedHistory: any[]) => {
    const sorted = [...updatedHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestInsemination = sorted[0];

    const newInsemNumber = sorted.length;

    setCows(
      cows.map((cow) => {
        if (cow.id === cowId) {
          const calculated = calculateReproductionFields({
            currentCalvingDate: cow.currentCalvingDate,
            previousCalvingDate: cow.previousCalvingDate,
            lastInseminationDate: latestInsemination ? latestInsemination.date : '',
            firstInseminationDate: cow.firstInseminationDate,
            firstHeatDate: cow.firstHeatDate,
            inseminationNumber: newInsemNumber,
          });

          return {
            ...cow,
            ...calculated,
            lastInseminationDate: latestInsemination ? latestInsemination.date : '',
            bull: latestInsemination ? latestInsemination.bull : '',
            inseminationNumber: newInsemNumber,
            inseminationHistory: sorted,
          };
        }
        return cow;
      })
    );
  };

  const handleOpenCreateModal = () => {
    setCowToEdit(null);
    setIsModalOpen(true);
  };
  const handleEditCow = (cow: Cow) => {
    setCowToEdit(cow);
    setIsModalOpen(true);
  };
  const handleDeleteCow = (id: number) =>
    setCows(
      cows.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i + 1 })),
    );
  const handleOpenInseminationModal = (cow: Cow) => {
    setCowToInseminate(cow);
    setIsInsemModalOpen(true);
  };
  const handleOpenCalvingModal = (cow: Cow) => {
    setCowToCalve(cow);
    setIsCalvingModalOpen(true);
  };
  const handleOpenCalvingHistoryModal = (cow: Cow) => {
    setCowForCalvingHistory(cow);
    setIsCalvingHistoryModalOpen(true);
  };
  const handleOpenInseminationHistoryModal = (cow: Cow) => {
    setCowForInseminationHistory(cow);
    setIsInseminationHistoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 w-full">
      <div className="w-full space-y-6">
        <header className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-emerald-600 w-full">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
              Controle Reprodutivo
            </h1>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            + Nova Vaca
          </button>
        </header>

        <main className="w-full space-y-6">
          {/* Bloco de KPIs / Indicadores Reprodutivos */}
          <DashboardKPIs cows={cows} />

          {/* Tabela Principal */}
          <CowTable
            cows={cows}
            onEdit={handleEditCow}
            onDelete={handleDeleteCow}
            onInsemination={handleOpenInseminationModal}
            onCalving={handleOpenCalvingModal}
            onOpenCalvingHistory={handleOpenCalvingHistoryModal}
            onOpenInseminationHistory={handleOpenInseminationHistoryModal}
          />
        </main>

        <CowForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCow}
          cowToEdit={cowToEdit}
          cows={cows}
        />
        <InseminationModal
          isOpen={isInsemModalOpen}
          onClose={() => setIsInsemModalOpen(false)}
          onSave={handleSaveInsemination}
          cow={cowToInseminate}
        />
        <CalvingModal
          isOpen={isCalvingModalOpen}
          onClose={() => setIsCalvingModalOpen(false)}
          onSave={handleSaveCalving}
          cow={cowToCalve}
        />
        <CalvingHistoryModal
          isOpen={isCalvingHistoryModalOpen}
          onClose={() => setIsCalvingHistoryModalOpen(false)}
          cow={cowForCalvingHistory}
          onUpdateHistory={handleUpdateCalvingHistory}
        />
        <InseminationHistoryModal
          isOpen={isInseminationHistoryModalOpen}
          onClose={() => setIsInseminationHistoryModalOpen(false)}
          cow={cowForInseminationHistory}
          onUpdateHistory={handleUpdateInseminationHistory}
        />
      </div>
    </div>
  );
}

export default App;