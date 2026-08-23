import { useState, useEffect } from "react";
import { INITIAL_COWS } from "./data/initialCows";
import { CowTable } from "./components/CowTable";
import { CowForm } from "./components/CowForm";
import { InseminationModal } from "./components/InseminationModal";
import { CalvingModal } from "./components/CalvingModal";
import { CalvingHistoryModal } from "./components/CalvingHistoryModal";
import { InseminationHistoryModal } from "./components/InseminationHistoryModal";
import { DashboardKPIs } from "./components/DashboardKPIs";
import type { Cow } from "./types/cow";
import { calculateReproductionFields } from "./utils/reproductionCalculations";
import { DashboardAlerts } from "./components/DashboardAlerts";
import { ReproductionGauges } from "./components/ReproductionGauges";
import { GeneralSituationDashboard } from "./components/GeneralSituationDashboard";

export function App() {
  const getCategoryCS = (iosCount: number) => {
    if (iosCount === 0) return "Nulípara";
    if (iosCount === 1) return "Primípara";
    return "Multípara";
  };

  // Função auxiliar para recalcular o número de cios efetivos com base nas IAs sem sucesso anterior ou até a bem-sucedida
  const calculateEffectiveInsemNumber = (
    history: any[],
    currentInsemNum: number,
  ) => {
    if (!history || history.length === 0) return currentInsemNum;

    // Conta quantas tentativas foram feitas no período ativo atual (ou conta sequencial até uma com sucesso)
    let count = 0;
    for (const item of history) {
      count++;
      if (item.successStatus === "Prenhe / Sucesso") {
        break; // Se achou uma bem-sucedida, o ciclo de cios deste período fecha nela
      }
    }
    return count > 0 ? count : currentInsemNum || 1;
  };

  const [cows, setCows] = useState<Cow[]>(() => {
    const saved = localStorage.getItem("@gestar_cows");
    if (saved) {
      const parsedCows: Cow[] = JSON.parse(saved);
      return parsedCows.map((cow) => {
        const effectiveInsemNum = calculateEffectiveInsemNumber(
          cow.inseminationHistory || [],
          cow.inseminationNumber,
        );
        const calculated = calculateReproductionFields({
          currentCalvingDate: cow.currentCalvingDate,
          previousCalvingDate: cow.previousCalvingDate,
          lastInseminationDate: cow.lastInseminationDate,
          firstInseminationDate: cow.firstInseminationDate,
          firstHeatDate: cow.firstHeatDate,
          inseminationNumber: effectiveInsemNum,
        });
        return {
          ...cow,
          ...calculated,
          inseminationNumber: effectiveInsemNum,
          categoryGS: getCategoryCS(effectiveInsemNum),
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

  const [isCalvingHistoryModalOpen, setIsCalvingHistoryModalOpen] =
    useState(false);
  const [cowForCalvingHistory, setCowForCalvingHistory] = useState<Cow | null>(
    null,
  );

  const [isInseminationHistoryModalOpen, setIsInseminationHistoryModalOpen] =
    useState(false);
  const [cowForInseminationHistory, setCowForInseminationHistory] =
    useState<Cow | null>(null);

  useEffect(() => {
    localStorage.setItem("@gestar_cows", JSON.stringify(cows));
  }, [cows]);

  const handleSaveCow = (cowData: any) => {
    const trimmedTag = (cowData.numberTag || "").trim();

    if (trimmedTag) {
      const duplicateCow = cows.find(
        (c) =>
          c.numberTag.trim().toLowerCase() === trimmedTag.toLowerCase() &&
          (!cowToEdit || c.id !== cowToEdit.id),
      );

      if (duplicateCow) {
        alert(
          `Erro: Já existe uma vaca cadastrada com o número de brinco "${trimmedTag}" (${duplicateCow.name}).`,
        );
        return;
      }
    }

    const iosCount = cowData.inseminationNumber ?? 0;
    const computedCategory = getCategoryCS(iosCount);

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
        categoryGS: computedCategory,
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
        categoryGS: computedCategory,
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

          const updatedPreviousCalving =
            cow.currentCalvingDate || cow.previousCalvingDate;
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
            calvingHistory: [previousState, ...(cow.calvingHistory || [])],
          };
        }
        return cow;
      }),
    );
  };

  const handleUpdateCalvingHistory = (
    cowId: number,
    updatedDates: string[],
  ) => {
    const sortedDates = [...updatedDates].sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime(),
    );

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
      }),
    );
  };

 const handleSaveInsemination = (
    cowId: number,
    insemData: {
      lastInseminationDate: string;
      bull: string;
      incrementInseminationNumber: boolean;
      successStatus: string;
    },
  ) => {
    setCows(
      cows.map((cow) => {
        if (cow.id === cowId) {
          // Cria o registro exato da inseminação que está sendo adicionada agora,
          // preservando especificamente a data e o touro informados neste modal.
          const newInseminationRecord = {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            date: insemData.lastInseminationDate,
            lastInseminationDate: insemData.lastInseminationDate,
            bull: insemData.bull,
            inseminationNumber: (cow.inseminationNumber || 0) + 1,
            successStatus: insemData.successStatus || 'Pendente',
          };

          const newInsemNumber = insemData.incrementInseminationNumber
            ? (cow.inseminationNumber || 0) + 1
            : (cow.inseminationNumber || 1);

          const newCategoryGS = getCategoryCS(newInsemNumber);

          const firstInseminationDate =
            cow.firstInseminationDate || insemData.lastInseminationDate;
          const firstHeatDate =
            cow.firstHeatDate || insemData.lastInseminationDate;

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
              newInseminationRecord,
              ...(cow.inseminationHistory || []),
            ],
          };
        }
        return cow;
      }),
    );
  };

  const handleUpdateInseminationHistory = (
    cowId: number,
    updatedHistory: any[],
  ) => {
    const sorted = [...updatedHistory].sort(
      (a, b) =>
        new Date(b.date || b.lastInseminationDate).getTime() -
        new Date(a.date || a.lastInseminationDate).getTime(),
    );
    const latestInsemination = sorted[0];

    const effectiveInsemNumber = calculateEffectiveInsemNumber(
      sorted,
      sorted.length,
    );
    const newCategoryGS = getCategoryCS(effectiveInsemNumber);

    setCows(
      cows.map((cow) => {
        if (cow.id === cowId) {
          const calculated = calculateReproductionFields({
            currentCalvingDate: cow.currentCalvingDate,
            previousCalvingDate: cow.previousCalvingDate,
            lastInseminationDate: latestInsemination
              ? latestInsemination.lastInseminationDate ||
                latestInsemination.date
              : "",
            firstInseminationDate: cow.firstInseminationDate,
            firstHeatDate: cow.firstHeatDate,
            inseminationNumber: effectiveInsemNumber,
          });

          return {
            ...cow,
            ...calculated,
            lastInseminationDate: latestInsemination
              ? latestInsemination.lastInseminationDate ||
                latestInsemination.date
              : "",
            bull: latestInsemination ? latestInsemination.bull : "",
            inseminationNumber: effectiveInsemNumber,
            categoryGS: newCategoryGS,
            inseminationHistory: sorted,
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
        <header className="bg-white shadow rounded-lg p-6 border-l-4 border-emerald-600 w-full flex items-center gap-4">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-gestar.png`}
            alt="Logo Gestar"
            className="h-12 w-auto object-contain"
          />
        </header>

        <GeneralSituationDashboard cows={cows} />

        <main className="w-full space-y-6">
          <DashboardKPIs cows={cows} />
          <ReproductionGauges cows={cows} />
          <DashboardAlerts cows={cows} />

          {/* Seção única contendo o título do rebanho, o botão de nova vaca e a tabela */}
          <div className="bg-white rounded-lg shadow p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Gerenciamento do Rebanho
                </h2>
                <p className="text-xs text-gray-500">
                  Lista completa de animais e histórico reprodutivo
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 font-semibold text-sm transition-colors shadow flex items-center gap-2"
              >
                <span>+ Nova Vaca</span>
              </button>
            </div>

            <CowTable
              cows={cows}
              onEdit={handleEditCow}
              onDelete={handleDeleteCow}
              onInsemination={handleOpenInseminationModal}
              onCalving={handleOpenCalvingModal}
              onOpenCalvingHistory={handleOpenCalvingHistoryModal}
              onOpenInseminationHistory={handleOpenInseminationHistoryModal}
            />
          </div>
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
