import { useState, useEffect } from "react";
import { INITIAL_COWS } from "./data/initialCows";
import { CowTable } from "./components/CowTable";
import { CowForm } from "./components/CowForm";
import { InseminationModal } from "./components/InseminationModal";
import type { Cow } from "./types/cow";
import { calculateReproductionFields } from "./utils/reproductionCalculations";

export function App() {
  const [cows, setCows] = useState<Cow[]>(() => {
    const saved = localStorage.getItem("@gestar_cows");
    return saved ? JSON.parse(saved) : INITIAL_COWS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cowToEdit, setCowToEdit] = useState<Cow | null>(null);
  const [isInsemModalOpen, setIsInsemModalOpen] = useState(false);
  const [cowToInseminate, setCowToInseminate] = useState<Cow | null>(null);

  useEffect(() => {
    localStorage.setItem("@gestar_cows", JSON.stringify(cows));
  }, [cows]);

  const handleSaveCow = (cowData: any) => {
    if (cowToEdit) {
      const updatedCow: Cow = {
        ...cowToEdit,
        ...cowData,
        firstHeatDate: cowData.firstHeatDate || "",
        firstInseminationDate: cowData.firstInseminationDate || "",
        previousCalvingDate: cowData.previousCalvingDate || "",
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
        lastInseminationDate: cowData.lastInseminationDate || "",
        lastHeatDate: cowData.lastHeatDate || "",
        bull: cowData.bull || "",
        dryingDate: cowData.dryingDate || "",
        observations: cowData.observations || "",
        inseminationHistory: [],
      };
      setCows([...cows, newCow]);
    }
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
          };

          const newInsemNumber = insemData.incrementInseminationNumber
            ? cow.inseminationNumber + 1
            : cow.inseminationNumber;

          const calculated = calculateReproductionFields({
            currentCalvingDate: cow.currentCalvingDate,
            previousCalvingDate: cow.previousCalvingDate,
            lastInseminationDate: insemData.lastInseminationDate,
            firstInseminationDate: cow.firstInseminationDate,
            firstHeatDate: cow.firstHeatDate,
            inseminationNumber: newInsemNumber,
          });

          return {
            ...cow,
            lastInseminationDate: insemData.lastInseminationDate,
            bull: insemData.bull,
            inseminationNumber: newInsemNumber,
            ...calculated,
            // Garante explicitamente que nenhum campo calculado opcional vire undefined
            firstHeatDate: calculated.firstHeatDate || "",
            firstInseminationDate: calculated.firstInseminationDate || "",
            lastHeatDate: calculated.lastHeatDate || "",
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

  const handleUndoInsemination = (cowId: number) => {
    setCows(
      cows.map((cow) => {
        if (
          cow.id === cowId &&
          cow.inseminationHistory &&
          cow.inseminationHistory.length > 0
        ) {
          const lastState = cow.inseminationHistory[0];
          const remainingHistory = cow.inseminationHistory.slice(1);

          const calculated = calculateReproductionFields({
            currentCalvingDate: cow.currentCalvingDate,
            previousCalvingDate: cow.previousCalvingDate,
            lastInseminationDate: lastState.lastInseminationDate,
            firstInseminationDate: cow.firstInseminationDate,
            firstHeatDate: cow.firstHeatDate,
            inseminationNumber: lastState.inseminationNumber,
          });

          return {
            ...cow,
            lastInseminationDate: lastState.lastInseminationDate,
            bull: lastState.bull,
            inseminationNumber: lastState.inseminationNumber,
            ...calculated,
            // Garante explicitamente que nenhum campo calculado opcional vire undefined
            firstHeatDate: calculated.firstHeatDate || "",
            firstInseminationDate: calculated.firstInseminationDate || "",
            lastHeatDate: calculated.lastHeatDate || "",
            inseminationHistory: remainingHistory,
          };
        }
        return cow;
      }),
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-l-4 border-emerald-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
              Controle Reprodutivo
            </h1>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg"
          >
            + Nova Vaca
          </button>
        </header>

        <main>
          <CowTable
            cows={cows}
            onEdit={handleEditCow}
            onDelete={handleDeleteCow}
            onInsemination={handleOpenInseminationModal}
            onUndoInsemination={handleUndoInsemination}
          />
        </main>

        <CowForm
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCow}
          cowToEdit={cowToEdit}
        />
        <InseminationModal
          isOpen={isInsemModalOpen}
          onClose={() => setIsInsemModalOpen(false)}
          onSave={handleSaveInsemination}
          cow={cowToInseminate}
        />
      </div>
    </div>
  );
}

export default App;
