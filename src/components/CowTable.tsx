import React, { useState, useMemo } from "react";
import type { Cow } from "../types/cow";

interface CowTableProps {
  cows: Cow[];
  onEdit: (cow: Cow) => void;
  onDelete: (id: number) => void;
  onInsemination: (cow: Cow) => void;
  onCalving: (cow: Cow) => void;
  onOpenCalvingHistory: (cow: Cow) => void;
  onOpenInseminationHistory: (cow: Cow) => void;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-";
  if (!/^\d{4}-\d{2}-\d{2}/.test(dateString)) return dateString;
  const [year, month, day] = dateString.split("T")[0].split("-");
  return `${day}/${month}/${year}`;
};

// Função auxiliar atualizada e sem erros de escopo
const getLatestDGStatus = (cow: Cow) => {
  const latest = cow.inseminationHistory?.[0];

  // 1. Verifica se existe parto atual para contar os 30 dias de PEV
  if (cow.currentCalvingDate) {
    const calvingDate = new Date(cow.currentCalvingDate);
    const today = new Date();
    const diffTime = today.getTime() - calvingDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Se estiver dentro dos primeiros 30 dias E não houver uma IA posterior ao parto
    if (diffDays >= 0 && diffDays <= 30) {
      if (!latest || new Date(latest.date || 0) < calvingDate || latest.successStatus === "PEV") {
        return "PEV";
      }
    } else if (diffDays > 30) {
      // Se já passaram mais de 30 dias do parto:
      if (!latest || new Date(latest.date || 0) < calvingDate || latest.successStatus === "PEV") {
        return "Pendente";
      }
    }
  }

  // 2. Avalia o histórico normal de IA caso já tenha movimentações posteriores
  if (cow.inseminationHistory && cow.inseminationHistory.length > 0 && latest) {
    const status = latest.successStatus;
    if (status === "Prenhe / Sucesso" || status === "DG+") return "DG+";
    if (status === "Vazia / Falha" || status === "DG-") return "DG-";
    if (status === "PEV") return "PEV";
    return "Pendente";
  }

  // 3. Padrão se não houver dados
  return "Pendente";
};

export const CowTable: React.FC<CowTableProps> = ({
  cows,
  onEdit,
  onDelete,
  onInsemination,
  onCalving,
  onOpenCalvingHistory,
  onOpenInseminationHistory,
}) => {
  // Filtros Básicos
  const [filterTag, setFilterTag] = useState("");
  const [filterName, setFilterName] = useState("");

  // Filtros Avançados
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedSit, setAdvancedSit] = useState("");
  const [advancedDG, setAdvancedDG] = useState("");
  const [advancedGS, setAdvancedGS] = useState("");
  const [advancedBull, setAdvancedBull] = useState("");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Listas dinâmicas para os selects
  const uniqueSits = useMemo(
    () => Array.from(new Set(cows.map((c) => c.situation).filter(Boolean))),
    [cows],
  );
  const uniqueDGs = useMemo(
    () =>
      Array.from(
        new Set(cows.map((c) => getLatestDGStatus(c)).filter(Boolean)),
      ),
    [cows],
  );
  const uniqueGSs = useMemo(
    () => Array.from(new Set(cows.map((c) => c.categoryGS).filter(Boolean))),
    [cows],
  );
  const uniqueBulls = useMemo(
    () => Array.from(new Set(cows.map((c) => c.bull).filter(Boolean))),
    [cows],
  );

  // Lógica de Filtragem Completa
  const filteredCows = useMemo(() => {
    return cows.filter((cow) => {
      const matchTag = cow.numberTag
        .toLowerCase()
        .includes(filterTag.toLowerCase());
      const matchName = cow.name
        .toLowerCase()
        .includes(filterName.toLowerCase());

      const cowGS = cow.categoryGS || "";
      const cowDG = getLatestDGStatus(cow);

      const matchSit = advancedSit ? cow.situation === advancedSit : true;
      const matchDG = advancedDG ? cowDG === advancedDG : true;
      const matchGS = advancedGS ? cowGS === advancedGS : true;
      const matchBull = advancedBull ? cow.bull === advancedBull : true;

      return (
        matchTag && matchName && matchSit && matchDG && matchGS && matchBull
      );
    });
  }, [
    cows,
    filterTag,
    filterName,
    advancedSit,
    advancedDG,
    advancedGS,
    advancedBull,
  ]);

  const totalPages = Math.ceil(filteredCows.length / itemsPerPage);

  const paginatedCows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCows.slice(start, start + itemsPerPage);
  }, [filteredCows, currentPage, itemsPerPage]);

  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const hasActiveAdvancedFilters =
    advancedSit || advancedDG || advancedGS || advancedBull;

  const clearAllFilters = () => {
    setFilterTag("");
    setFilterName("");
    setAdvancedSit("");
    setAdvancedDG("");
    setAdvancedGS("");
    setAdvancedBull("");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca Rápida e Botão de Filtros Avançados */}
      <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <input
            type="text"
            placeholder="Filtrar por Nº Brinco..."
            value={filterTag}
            onChange={(e) => {
              setFilterTag(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-44 text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Filtrar por Nome..."
            value={filterName}
            onChange={(e) => {
              setFilterName(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-44 text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showAdvancedFilters || hasActiveAdvancedFilters
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            <span>⚙️ Filtros Avançados</span>
            {hasActiveAdvancedFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            )}
          </button>

          {(filterTag || filterName || hasActiveAdvancedFilters) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-2 bg-red-50 rounded-lg border border-red-200 transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-right">
          Mostrando <strong>{filteredCows.length}</strong> de {cows.length}{" "}
          animais
        </div>
      </div>

      {/* Painel Retrátil de Filtros Avançados */}
      {showAdvancedFilters && (
        <div className="bg-emerald-50/60 p-4 rounded-lg border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn">
          <div>
            <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
              Situação (Sit.)
            </label>
            <select
              value={advancedSit}
              onChange={(e) => {
                setAdvancedSit(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-emerald-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todas as Situações</option>
              {uniqueSits.map((sit) => (
                <option key={sit} value={sit}>
                  {sit === "L"
                    ? "L (Lactação)"
                    : sit === "S"
                      ? "S (Seca)"
                      : sit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
              Diagnóstico (DG)
            </label>
            <select
              value={advancedDG}
              onChange={(e) => {
                setAdvancedDG(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-emerald-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todos os Diagnósticos</option>
              {uniqueDGs.map((dg) => (
                <option key={dg} value={dg}>
                  {dg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
              Grau de Sangue / Categoria (G.S.)
            </label>
            <select
              value={advancedGS}
              onChange={(e) => {
                setAdvancedGS(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-emerald-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todos os G.S.</option>
              {uniqueGSs.map((gs) => (
                <option key={gs} value={gs}>
                  {gs}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-emerald-900 uppercase mb-1">
              Touro
            </label>
            <select
              value={advancedBull}
              onChange={(e) => {
                setAdvancedBull(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs border border-emerald-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todos os Touros</option>
              {uniqueBulls.map((bull) => (
                <option key={bull} value={bull}>
                  {bull}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tabela Principal */}
      <div className="w-full shadow-md sm:rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="relative w-full overflow-x-auto xl:overflow-x-visible">
          <table className="w-full text-left text-xs text-gray-700 table-auto border-collapse">
            <thead className="bg-emerald-800 text-white uppercase font-semibold sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="px-2 py-2.5 text-center sticky left-0 bg-emerald-800 z-30">
                  Ações
                </th>
                <th className="px-1.5 py-2.5 bg-emerald-800">Ord.</th>
                <th className="px-1.5 py-2.5 bg-emerald-800">Num.</th>
                <th className="px-2 py-2.5 bg-emerald-800">Vacas</th>
                <th className="px-1.5 py-2.5 bg-emerald-800">Sit.</th>
                <th className="px-2 py-2.5 bg-emerald-800">G.S.</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  Crias
                </th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  Sexo
                </th>
                <th className="px-2 py-2.5 bg-emerald-800">Parto Atual</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  Hist. Parto
                </th>
                <th className="px-2 py-2.5 bg-emerald-800">Parto Ant.</th>
                <th className="px-2 py-2.5 bg-emerald-800">1ª IA</th>
                <th className="px-2 py-2.5 bg-emerald-800">Últ. IA</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  Hist. IA
                </th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  Nº IA
                </th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  Cios
                </th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  DEL
                </th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">PS</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  DPIA
                </th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">IP</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  IP Prev.
                </th>
                <th className="px-2 py-2.5 bg-emerald-800">Prev. Parto</th>
                <th className="px-2 py-2.5 bg-emerald-800">Touro</th>
                <th className="px-1.5 py-2.5 bg-emerald-800">DG</th>
                <th className="px-2 py-2.5 bg-emerald-800">Secar</th>
                <th className="px-2 py-2.5 bg-emerald-800">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCows.length === 0 ? (
                <tr>
                  <td colSpan={26} className="py-8 text-center text-gray-400">
                    Nenhum animal encontrado com os filtros informados.
                  </td>
                </tr>
              ) : (
                paginatedCows.map((cow) => {
                  const displayGS = cow.categoryGS || "-";
                  const dgStatus = getLatestDGStatus(cow);

                  // Define a cor do badge de acordo com o status atual do DG (incluindo PEV em roxo)
                  let dgBadgeStyle = "bg-amber-100 text-amber-800";
                  if (dgStatus === "DG+") {
                    dgBadgeStyle = "bg-green-100 text-green-800";
                  } else if (dgStatus === "DG-") {
                    dgBadgeStyle = "bg-red-100 text-red-800";
                  } else if (dgStatus === "PEV") {
                    dgBadgeStyle = "bg-purple-100 text-purple-800";
                  }

                  // Verifica se realmente possui IA lançada/histórico
                  const hasRealInsem = 
                    (cow.inseminationNumber && cow.inseminationNumber > 0 && (cow.lastInseminationDate || (cow.inseminationHistory && cow.inseminationHistory.length > 0))) ||
                    (cow.inseminationHistory && cow.inseminationHistory.length > 0);

                  return (
                    <tr
                      key={cow.id}
                      className="hover:bg-emerald-50 transition-colors"
                    >
                      <td className="px-2 py-2 text-center sticky left-0 bg-white shadow-sm whitespace-nowrap z-10">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => onInsemination(cow)}
                            className="p-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 font-bold text-[10px] px-1"
                            title="Lançar Inseminação"
                          >
                            +IA
                          </button>
                          <button
                            onClick={() => onCalving(cow)}
                            className="p-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 font-bold text-[10px] px-1"
                            title="Lançar Parto"
                          >
                            +Parto
                          </button>
                          <button
                            onClick={() => onEdit(cow)}
                            className="p-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Excluir ${cow.name}?`))
                                onDelete(cow.id);
                            }}
                            className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                      <td className="px-1.5 py-2 font-medium whitespace-nowrap">
                        {cow.order}
                      </td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        {cow.numberTag}
                      </td>
                      <td className="px-2 py-2 font-bold text-gray-900 whitespace-nowrap">
                        {cow.name}
                      </td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${cow.situation === "L" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}`}
                        >
                          {cow.situation}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap font-medium text-gray-800">
                        {displayGS}
                      </td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        {cow.offspringCount}
                      </td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        {cow.gender}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {formatDate(cow.currentCalvingDate)}
                      </td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => onOpenCalvingHistory(cow)}
                          className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-[10px] px-1.5 font-bold shadow-sm"
                        >
                          📜
                        </button>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {formatDate(cow.previousCalvingDate)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {formatDate(
                          cow.firstInseminationDate || cow.firstHeatDate,
                        )}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {formatDate(
                          cow.lastInseminationDate || cow.lastHeatDate,
                        )}
                      </td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => onOpenInseminationHistory(cow)}
                          className="p-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 text-[10px] px-1.5 font-bold shadow-sm border border-emerald-200"
                        >
                          📋
                        </button>
                      </td>
                      <td className="px-1.5 py-2 text-center font-semibold whitespace-nowrap">
                        {hasRealInsem ? cow.inseminationNumber : "-"}
                      </td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        {cow.heatsCount}
                      </td>
                      <td className="px-1.5 py-2 text-center font-bold text-emerald-700 whitespace-nowrap">
                        {cow.del}
                      </td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        {cow.ps}
                      </td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        {cow.dpia}
                      </td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        {cow.ip}
                      </td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        {cow.expectedIp}
                      </td>
                     <td className="px-2 py-2 whitespace-nowrap">
                        {(() => {
                          const latestInsem = cow.inseminationHistory?.[0];
                          const isPositive = latestInsem && (
                            latestInsem.successStatus === 'DG+' || 
                            latestInsem.successStatus === 'Prenhe / Sucesso'
                          );
                          return isPositive ? formatDate(cow.expectedCalvingDate) : "-";
                        })()}
                      </td>
                      <td className="px-2 py-2 font-medium text-indigo-700 whitespace-nowrap">
                        {cow.bull}
                      </td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${dgBadgeStyle}`}
                        >
                          {dgStatus}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {formatDate(cow.dryingDate)}
                      </td>
                      <td className="px-2 py-2 text-gray-500 whitespace-nowrap">
                        {cow.observations || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>Total: {filteredCows.length} registros filtrados</span>
          <span>|</span>
          <span>Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>por página</span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            Página <strong>{currentPage}</strong> de{" "}
            <strong>{totalPages || 1}</strong>
          </span>
          <div className="space-x-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};