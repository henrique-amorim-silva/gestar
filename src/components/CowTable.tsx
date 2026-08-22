import React from 'react';
import type { Cow } from '../types/cow';

interface CowTableProps {
  cows: Cow[];
  onEdit: (cow: Cow) => void;
  onDelete: (id: number) => void;
  onInsemination: (cow: Cow) => void;
  onCalving: (cow: Cow) => void;
  onUndoInsemination: (cowId: number) => void;
}

export const CowTable: React.FC<CowTableProps> = ({ cows, onEdit, onDelete, onInsemination, onCalving, onUndoInsemination }) => {
  return (
    <div className="w-full shadow-md sm:rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="w-full overflow-x-auto xl:overflow-x-visible">
        <table className="w-full text-left text-xs text-gray-700 table-auto">
          <thead className="bg-emerald-800 text-white uppercase font-semibold">
            <tr>
              <th className="px-2 py-2.5 text-center sticky left-0 bg-emerald-800 z-10">Ações</th>
              <th className="px-1.5 py-2.5">Ord.</th>
              <th className="px-1.5 py-2.5">Num.</th>
              <th className="px-2 py-2.5">Vacas</th>
              <th className="px-1.5 py-2.5">Sit.</th>
              <th className="px-2 py-2.5">G.S.</th>
              <th className="px-1.5 py-2.5 text-center">Crias</th>
              <th className="px-1.5 py-2.5 text-center">Sexo</th>
              <th className="px-2 py-2.5">Parto Atual</th>
              <th className="px-2 py-2.5">Parto Ant.</th>
              <th className="px-2 py-2.5">1º Cio/IA</th>
              <th className="px-2 py-2.5">Últ. Cio/IA</th>
              <th className="px-1.5 py-2.5 text-center">Nº IA</th>
              <th className="px-1.5 py-2.5 text-center">Cios</th>
              <th className="px-1.5 py-2.5 text-center">DEL</th>
              <th className="px-1.5 py-2.5 text-center">PS</th>
              <th className="px-1.5 py-2.5 text-center">DPIA</th>
              <th className="px-1.5 py-2.5 text-center">IP</th>
              <th className="px-1.5 py-2.5 text-center">IP Prev.</th>
              <th className="px-2 py-2.5">Prev. Parto</th>
              <th className="px-2 py-2.5">Touro</th>
              <th className="px-1.5 py-2.5">DG</th>
              <th className="px-2 py-2.5">Secar</th>
              <th className="px-2 py-2.5">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cows.map((cow) => {
              const hasHistory = cow.inseminationHistory && cow.inseminationHistory.length > 0;

              return (
                <tr key={cow.id} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-2 py-2 text-center sticky left-0 bg-white shadow-sm whitespace-nowrap">
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
                      {hasHistory && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja desfazer o último lançamento de IA da vaca ${cow.name}?`)) {
                              onUndoInsemination(cow.id);
                            }
                          }}
                          className="p-1 bg-amber-100 text-amber-800 rounded hover:bg-amber-200 text-[10px] px-1"
                          title="Desfazer Última IA"
                        >
                          ↩️
                        </button>
                      )}
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
                  <td className="px-2 py-2 whitespace-nowrap">{cow.currentCalvingDate}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{cow.previousCalvingDate}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{cow.firstInseminationDate || cow.firstHeatDate}</td>
                  <td className="px-2 py-2 whitespace-nowrap">{cow.lastInseminationDate || cow.lastHeatDate}</td>
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};