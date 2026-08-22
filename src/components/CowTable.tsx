import React, { useState, useMemo } from 'react';
import type { Cow } from '../types/cow';

interface CowTableProps {
  cows: Cow[];
  onEdit: (cow: Cow) => void;
  onDelete: (id: number) => void;
  onInsemination: (cow: Cow) => void;
  onCalving: (cow: Cow) => void;
  onOpenCalvingHistory: (cow: Cow) => void;
  onOpenInseminationHistory: (cow: Cow) => void;
}

export const CowTable: React.FC<CowTableProps> = ({ 
  cows, 
  onEdit, 
  onDelete, 
  onInsemination, 
  onCalving, 
  onOpenCalvingHistory,
  onOpenInseminationHistory 
}) => {
  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Lógica de Paginação
  const totalPages = Math.ceil(cows.length / itemsPerPage);

  const paginatedCows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return cows.slice(start, start + itemsPerPage);
  }, [cows, currentPage, itemsPerPage]);

  // Ajusta a página atual se exceder o total após uma exclusão ou mudança de filtro
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  return (
    <div className="space-y-4">
      {/* Container Principal com Rolagem e Cabeçalho Fixo */}
      <div className="w-full shadow-md sm:rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto relative w-full overflow-x-auto xl:overflow-x-visible">
          <table className="w-full text-left text-xs text-gray-700 table-auto border-collapse">
            <thead className="bg-emerald-800 text-white uppercase font-semibold sticky top-0 z-20 shadow-sm">
              <tr>
                <th className="px-2 py-2.5 text-center sticky left-0 bg-emerald-800 z-30">Ações</th>
                <th className="px-1.5 py-2.5 bg-emerald-800">Ord.</th>
                <th className="px-1.5 py-2.5 bg-emerald-800">Num.</th>
                <th className="px-2 py-2.5 bg-emerald-800">Vacas</th>
                <th className="px-1.5 py-2.5 bg-emerald-800">Sit.</th>
                <th className="px-2 py-2.5 bg-emerald-800">G.S.</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">Crias</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">Sexo</th>
                <th className="px-2 py-2.5 bg-emerald-800">Parto Atual</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  <div className="flex justify-center">Hist.</div>
                </th>
                <th className="px-2 py-2.5 bg-emerald-800">Parto Ant.</th>
                <th className="px-2 py-2.5 bg-emerald-800">1º Cio/IA</th>
                <th className="px-2 py-2.5 bg-emerald-800">Últ. Cio/IA</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">
                  <div className="flex justify-center">Hist. IA</div>
                </th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">Nº IA</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">Cios</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">DEL</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">PS</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">DPIA</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">IP</th>
                <th className="px-1.5 py-2.5 text-center bg-emerald-800">IP Prev.</th>
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
                    Nenhum animal cadastrado ou encontrado.
                  </td>
                </tr>
              ) : (
                paginatedCows.map((cow) => {
                  return (
                    <tr key={cow.id} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-2 py-2 text-center sticky left-0 bg-white shadow-sm whitespace-nowrap z-10">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => onInsemination(cow)}
                            className="p-1 bg-emerald-100 text-emerald-800 rounded hover:bg-emerald-200 font-bold text-[10px] px-1"
                            title="Lançar Inseminação (IA)"
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
                            title="Editar Vaca (Completo)"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja excluir a vaca ${cow.name}?`)) {
                                onDelete(cow.id);
                              }
                            }}
                            className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                            title="Excluir Vaca"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                      <td className="px-1.5 py-2 font-medium whitespace-nowrap">{cow.order}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">{cow.numberTag}</td>
                      <td className="px-2 py-2 font-bold text-gray-900 whitespace-nowrap">{cow.name}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${cow.situation === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                          {cow.situation}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">{cow.categoryGS || '-'}</td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">{cow.offspringCount}</td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">{cow.gender}</td>
                      
                      {/* Parto Atual */}
                      <td className="px-2 py-2 whitespace-nowrap">{cow.currentCalvingDate || '-'}</td>

                      {/* Histórico de Parto */}
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => onOpenCalvingHistory(cow)}
                          className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-[10px] px-1.5 font-bold shadow-sm"
                          title="Ver Histórico de Partos"
                        >
                          📜
                        </button>
                      </td>

                      {/* Parto Anterior */}
                      <td className="px-2 py-2 whitespace-nowrap">{cow.previousCalvingDate || '-'}</td>

                      <td className="px-2 py-2 whitespace-nowrap">{cow.firstInseminationDate || cow.firstHeatDate}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{cow.lastInseminationDate || cow.lastHeatDate}</td>
                      
                      {/* Histórico de IA */}
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">
                        <button
                          onClick={() => onOpenInseminationHistory(cow)}
                          className="p-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 text-[10px] px-1.5 font-bold shadow-sm border border-emerald-200"
                          title="Ver Histórico de Inseminações"
                        >
                          📋
                        </button>
                      </td>

                      <td className="px-1.5 py-2 text-center font-semibold whitespace-nowrap">{cow.inseminationNumber}</td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">{cow.heatsCount}</td>
                      <td className="px-1.5 py-2 text-center font-bold text-emerald-700 whitespace-nowrap">{cow.del}</td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">{cow.ps}</td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">{cow.dpia}</td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">{cow.ip}</td>
                      <td className="px-1.5 py-2 text-center whitespace-nowrap">{cow.expectedIp}</td>
                      <td className="px-2 py-2 whitespace-nowrap">{cow.expectedCalvingDate}</td>
                      <td className="px-2 py-2 font-medium text-indigo-700 whitespace-nowrap">{cow.bull}</td>
                      <td className="px-1.5 py-2 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${cow.diagnosisStatus === 'DG+' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {cow.diagnosisStatus}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">{cow.dryingDate}</td>
                      <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{cow.observations || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barra de Paginação e Seletor de Registros por Página */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reseta para a primeira página ao alterar o limite
            }}
            className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={10}>10</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>registros por página</span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            Página <strong>{currentPage}</strong> de <strong>{totalPages || 1}</strong>
          </span>
          <div className="space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium shadow-sm"
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};