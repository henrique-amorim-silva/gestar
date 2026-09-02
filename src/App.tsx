import { useState, useEffect, useMemo } from "react";
import { INITIAL_COWS } from "./data/initialCows";
import { CowTable } from "./components/CowTable";
import { CowForm } from "./components/CowForm";
import { InseminationModal } from "./components/InseminationModal";
import { CalvingModal } from "./components/CalvingModal";
import { CalvingHistoryModal } from "./components/CalvingHistoryModal";
import { InseminationHistoryModal } from "./components/InseminationHistoryModal";
import { NewFarmModal } from "./components/NewFarmModal";
import { DashboardKPIs } from "./components/DashboardKPIs";
import type { Cow, Farm } from "./types/cow";
import { calculateReproductionFields } from "./utils/reproductionCalculations";
import { DashboardAlerts } from "./components/DashboardAlerts";
import { ReproductionGauges } from "./components/ReproductionGauges";
import { GeneralSituationDashboard } from "./components/GeneralSituationDashboard";

export function App() {
  
   const calculateEffectiveInsemNumber = (
    history: any[],
    currentInsemNum: number,
  ) => {
    if (!history || history.length === 0) {
      return currentInsemNum > 0 ? currentInsemNum : 0;
    }
    return history.length;
  };

  const calculateEffectiveHeatsCount = (history: any[]) => {
    if (!history || history.length === 0) return 0;

    return history.filter(
      (item) =>
        item.successStatus === "Prenhe / Sucesso" ||
        item.successStatus === "DG+",
    ).length;
  };

  // Estados de Fazendas
  const [farms, setFarms] = useState<Farm[]>(() => {
    const saved = localStorage.getItem("app_farms");
    if (saved) return JSON.parse(saved);
    return [{ id: "fazenda-teste", name: "Fazenda Teste" }];
  });

  const [currentFarmId, setCurrentFarmId] = useState<string>(() => {
    const savedFarms = localStorage.getItem("app_farms");
    const parsedFarms = savedFarms
      ? JSON.parse(savedFarms)
      : [{ id: "fazenda-teste", name: "Fazenda Teste" }];
    return parsedFarms[0].id;
  });

  const [isNewFarmModalOpen, setIsNewFarmModalOpen] = useState(false);

  // Estados de Vacas
  const [cows, setCows] = useState<Cow[]>(() => {
    const saved = localStorage.getItem("@gestar_cows");
    if (saved) {
      const parsedCows: Cow[] = JSON.parse(saved);
      return parsedCows.map((cow) => {
        const effectiveInsemNum = calculateEffectiveInsemNumber(
          cow.inseminationHistory || [],
          cow.inseminationNumber,
        );
        const effectiveHeatsCount = calculateEffectiveHeatsCount(
          cow.inseminationHistory || [],
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
          farmID: cow.farmID || "fazenda-teste",
          ...calculated,
          inseminationNumber: effectiveInsemNum,
          heatsCount: effectiveHeatsCount,
        };
      });
    }
    return INITIAL_COWS.map((c) => ({ ...c, farmID: "fazenda-teste" }));
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

  // Sincronização com o localStorage
  useEffect(() => {
    localStorage.setItem("app_farms", JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    localStorage.setItem("@gestar_cows", JSON.stringify(cows));
  }, [cows]);

  const activeCows = useMemo(() => {
    return cows.filter((cow) => cow.farmID === currentFarmId);
  }, [cows, currentFarmId]);

  const handleCreateFarm = (farmName: string) => {
    const newId = "farm_" + Date.now();
    const newFarm: Farm = { id: newId, name: farmName };
    setFarms((prev) => [...prev, newFarm]);
    setCurrentFarmId(newId);
  };

  const handleSaveCow = (cowData: any) => {
    const trimmedTag = (cowData.numberTag || "").trim();

    if (trimmedTag) {
      const duplicateCow = cows.find(
        (c) =>
          c.farmID === currentFarmId &&
          c.numberTag.trim().toLowerCase() === trimmedTag.toLowerCase() &&
          (!cowToEdit || c.id !== cowToEdit.id),
      );

      if (duplicateCow) {
        alert(
          `Erro: Já existe uma vaca cadastrada com o número de brinco "${trimmedTag}" (${duplicateCow.name}) nesta fazenda.`,
        );
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
        bull: cowData.bull || "",
        dryingDate: cowData.dryingDate || "",
        observations: cowData.observations || "",
      };
      setCows(cows.map((cow) => (cow.id === cowToEdit.id ? updatedCow : cow)));
      setCowToEdit(null);
    } else {
      const farmCows = cows.filter((c) => c.farmID === currentFarmId);
      const nextOrder =
        farmCows.length > 0 ? Math.max(...farmCows.map((c) => c.order)) + 1 : 1;

      const newCow: Cow = {
        ...cowData,
        id: Date.now(),
        farmID: currentFarmId,
        order: nextOrder,
        numberTag: cowData.numberTag || "",
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

  const handleSaveCalving = (
    cowId: number,
    newCalvingDate: string,
    offspringCount: number,
  ) => {
    setCows(
      cows.map((cow) => {
        if (cow.id === cowId) {
          const previousState = {
            currentCalvingDate: cow.currentCalvingDate,
            previousCalvingDate: cow.previousCalvingDate,
            offspringCount: cow.offspringCount,
          };

          const updatedPreviousCalving =
            cow.currentCalvingDate || cow.previousCalvingDate;
          const updatedCurrentCalving = newCalvingDate;

          const pevRecord = {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            date: newCalvingDate,
            lastInseminationDate: newCalvingDate,
            bull: "",
            successStatus: "PEV",
            inseminationNumber: 0,
            isCalvingRecord: true,
            offspringCount: offspringCount, // Salva o número de crias no registro do histórico
          };

          const existingHistory = cow.inseminationHistory || [];
          const updatedHistory = [pevRecord, ...existingHistory];

          const calculated = calculateReproductionFields({
            currentCalvingDate: updatedCurrentCalving,
            previousCalvingDate: updatedPreviousCalving,
            lastInseminationDate: "",
            firstInseminationDate: "",
            firstHeatDate: "",
            inseminationNumber: 0,
          });

          return {
            ...cow,
            ...calculated,
            currentCalvingDate: updatedCurrentCalving,
            previousCalvingDate: updatedPreviousCalving,
            offspringCount: offspringCount,
            lastInseminationDate: "",
            firstInseminationDate: "",
            firstHeatDate: "",
            inseminationNumber: 0,
            bull: "",
            inseminationHistory: updatedHistory,
            calvingHistory: [previousState, ...(cow.calvingHistory || [])],
          };
        }
        return cow;
      }),
    );
  };

  const handleDeleteCalving = (cowId: number, dateToDelete?: string) => {
    setCows(
      cows.map((cow) => {
        if (cow.id === cowId) {
          // 1. Remove o registro de PEV/Parto correspondente
          const updatedHistory = (cow.inseminationHistory || []).filter(
            (item: any) => {
              if (!item.isCalvingRecord) return true;
              const itemDate = (
                item.date ||
                item.lastInseminationDate ||
                ""
              ).split("T")[0];
              return dateToDelete
                ? itemDate !== dateToDelete.split("T")[0]
                : false;
            },
          );

          // 2. Restaura o parto anterior salvo no histórico de partos (se houver)
          const previousCalving = cow.calvingHistory?.[0] || null;
          const remainingCalvingHistory = (cow.calvingHistory || []).slice(1);

          const updatedCurrentCalving = previousCalving
            ? previousCalving.currentCalvingDate
            : "";
          const updatedPreviousCalving = previousCalving
            ? previousCalving.previousCalvingDate
            : "";

          // 3. Atualiza o número de crias com base no parto remanescente mais recente
          const remainingCalvingRecords = updatedHistory
            .filter((item: any) => item.isCalvingRecord)
            .sort(
              (a: any, b: any) =>
                new Date(b.date || b.lastInseminationDate).getTime() -
                new Date(a.date || a.lastInseminationDate).getTime(),
            );

          const newOffspringCount =
            remainingCalvingRecords.length > 0
              ? remainingCalvingRecords[0].offspringCount || 1
              : 0;

          // 4. Identifica a última IA/Cobertura ativa que sobrou no histórico
          const activeInseminations = updatedHistory
            .filter((item: any) => !item.isCalvingRecord)
            .sort(
              (a: any, b: any) =>
                new Date(b.date || b.lastInseminationDate).getTime() -
                new Date(a.date || a.lastInseminationDate).getTime(),
            );

          const latestActiveInsem = activeInseminations[0] || null;

          const effectiveInsemNumber = calculateEffectiveInsemNumber(
            updatedHistory,
            activeInseminations.length,
          );
          const effectiveHeatsCount =
            calculateEffectiveHeatsCount(updatedHistory);

          const isLatestPositive =
            latestActiveInsem &&
            (latestActiveInsem.successStatus === "DG+" ||
              latestActiveInsem.successStatus === "Prenhe / Sucesso");

          const determinedLastInsemDate = latestActiveInsem
            ? latestActiveInsem.lastInseminationDate ||
              latestActiveInsem.date ||
              ""
            : "";

          // 5. Recalcula os campos reprodutivos passando explicitamente uma string vazia se não houver data
          const calculated = calculateReproductionFields({
            currentCalvingDate: updatedCurrentCalving,
            previousCalvingDate: updatedPreviousCalving,
            lastInseminationDate: determinedLastInsemDate,
            firstInseminationDate: cow.firstInseminationDate || "",
            firstHeatDate: cow.firstHeatDate || "",
            inseminationNumber: effectiveInsemNumber,
          });

          return {
            ...cow,
            ...calculated,
            expectedCalvingDate: isLatestPositive
              ? calculated.expectedCalvingDate
              : "",
            currentCalvingDate: updatedCurrentCalving,
            previousCalvingDate: updatedPreviousCalving,
            offspringCount: newOffspringCount,
            lastInseminationDate: determinedLastInsemDate,
            bull: latestActiveInsem ? latestActiveInsem.bull || "" : "",
            inseminationNumber: effectiveInsemNumber,
            heatsCount: effectiveHeatsCount,
            inseminationHistory: updatedHistory,
            calvingHistory: remainingCalvingHistory,
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
          const existingHistory = cow.inseminationHistory || [];
          const newInsemNumber = existingHistory.length + 1;

          const newInseminationRecord = {
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            date: insemData.lastInseminationDate,
            lastInseminationDate: insemData.lastInseminationDate,
            bull: insemData.bull,
            successStatus: insemData.successStatus || "Pendente",
            inseminationNumber: newInsemNumber,
          };

          const updatedHistory = [newInseminationRecord, ...existingHistory];

          const effectiveInsemNumber = calculateEffectiveInsemNumber(
            updatedHistory,
            newInsemNumber,
          );
          const effectiveHeatsCount =
            calculateEffectiveHeatsCount(updatedHistory);
          

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
            inseminationNumber: effectiveInsemNumber,
          });

          return {
            ...cow,
            ...calculated,
            lastInseminationDate: insemData.lastInseminationDate,
            bull: insemData.bull,
            inseminationNumber: effectiveInsemNumber,
            heatsCount: effectiveHeatsCount,
            firstInseminationDate,
            firstHeatDate,
            inseminationHistory: updatedHistory,
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

    const isLatestPositive =
      latestInsemination &&
      (latestInsemination.successStatus === "DG+" ||
        latestInsemination.successStatus === "Prenhe / Sucesso");

    const effectiveInsemNumber = calculateEffectiveInsemNumber(
      sorted,
      sorted.length,
    );
    const effectiveHeatsCount = calculateEffectiveHeatsCount(sorted);
    

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
            expectedCalvingDate: isLatestPositive
              ? calculated.expectedCalvingDate
              : "",
            lastInseminationDate: latestInsemination
              ? latestInsemination.lastInseminationDate ||
                latestInsemination.date
              : "",
            bull: latestInsemination ? latestInsemination.bull : "",
            inseminationNumber: effectiveInsemNumber,
            heatsCount: effectiveHeatsCount,
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
        <header className="bg-white shadow rounded-lg p-6 border-l-4 border-emerald-600 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <img
            src={`${import.meta.env.BASE_URL}images/logo-gestar.png`}
            alt="Logo Gestar"
            className="h-12 w-auto object-contain"
          />
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">
                Fazenda:
              </span>
              <select
                value={currentFarmId}
                onChange={(e) => setCurrentFarmId(e.target.value)}
                className="text-xs  text-black border border-emerald-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-medium"
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsNewFarmModalOpen(true)}
              className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg border border-emerald-600 transition-colors flex items-center gap-1 shadow-sm whitespace-nowrap"
            >
              <span>+ Nova Fazenda</span>
            </button>
          </div>
        </header>

        <GeneralSituationDashboard cows={activeCows} />

        <main className="w-full space-y-6">
          <DashboardKPIs cows={activeCows} />
          <ReproductionGauges cows={activeCows} />
          <DashboardAlerts cows={activeCows} />

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
              cows={activeCows}
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
          cows={activeCows}
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
          onDeleteCalving={handleDeleteCalving}
        />
        <InseminationHistoryModal
          isOpen={isInseminationHistoryModalOpen}
          onClose={() => setIsInseminationHistoryModalOpen(false)}
          cow={cowForInseminationHistory}
          onUpdateHistory={handleUpdateInseminationHistory}
        />
        <NewFarmModal
          isOpen={isNewFarmModalOpen}
          onClose={() => setIsNewFarmModalOpen(false)}
          onSave={handleCreateFarm}
        />
      </div>
    </div>
  );
}

export default App;
