import React from 'react';
import type { Cow } from '../types/cow';

interface CowTableProps {
  cows: Cow[];
}

export const CowTable: React.FC<CowTableProps> = ({ cows }) => {
  return (
    <div className="w-full overflow-x-auto shadow-md sm:rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-left text-xs text-gray-700 whitespace-nowrap">
        <thead className="bg-emerald-800 text-white uppercase font-semibold">
          <tr>
            <th className="px-3 py-3">Ord.</th>
            <th className="px-3 py-3">Num.</th>
            <th className="px-3 py-3">Vacas</th>
            <th className="px-3 py-3">Sit.</th>
            <th className="px-3 py-3">G.S.</th>
            <th className="px-3 py-3">Crias</th>
            <th className="px-3 py-3">Sexo</th>
            <th className="px-3 py-3">Parto Atual</th>
            <th className="px-3 py-3">Parto Ant.</th>
            <th className="px-3 py-3">1º Cio</th>
            <th className="px-3 py-3">1ª IA</th>
            <th className="px-3 py-3">Últ. Cio</th>
            <th className="px-3 py-3">Últ. IA</th>
            <th className="px-3 py-3">Nº IA</th>
            <th className="px-3 py-3">Cios</th>
            <th className="px-3 py-3">DEL</th>
            <th className="px-3 py-3">PS</th>
            <th className="px-3 py-3">DPIA</th>
            <th className="px-3 py-3">IP</th>
            <th className="px-3 py-3">IP Prev.</th>
            <th className="px-3 py-3">Prev. Parto</th>
            <th className="px-3 py-3">Touro</th>
            <th className="px-3 py-3">DG</th>
            <th className="px-3 py-3">Secar</th>
            <th className="px-3 py-3">Observações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {cows.map((cow) => (
            <tr key={cow.id} className="hover:bg-emerald-50 transition-colors">
              <td className="px-3 py-2 font-medium">{cow.order}</td>
              <td className="px-3 py-2">{cow.numberTag}</td>
              <td className="px-3 py-2 font-bold text-gray-900">{cow.name}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${cow.situation === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                  {cow.situation}
                </span>
              </td>
              <td className="px-3 py-2">{cow.categoryGS || '-'}</td>
              <td className="px-3 py-2 text-center">{cow.offspringCount}</td>
              <td className="px-3 py-2 text-center">{cow.gender}</td>
              <td className="px-3 py-2">{cow.currentCalvingDate}</td>
              <td className="px-3 py-2">{cow.previousCalvingDate}</td>
              <td className="px-3 py-2">{cow.firstHeatDate}</td>
              <td className="px-3 py-2">{cow.firstInseminationDate}</td>
              <td className="px-3 py-2">{cow.lastHeatDate}</td>
              <td className="px-3 py-2">{cow.lastInseminationDate}</td>
              <td className="px-3 py-2 text-center font-semibold">{cow.inseminationNumber}</td>
              <td className="px-3 py-2 text-center">{cow.heatsCount}</td>
              <td className="px-3 py-2 text-center font-bold text-emerald-700">{cow.del}</td>
              <td className="px-3 py-2 text-center">{cow.ps}</td>
              <td className="px-3 py-2 text-center">{cow.dpia}</td>
              <td className="px-3 py-2 text-center">{cow.ip}</td>
              <td className="px-3 py-2 text-center">{cow.expectedIp}</td>
              <td className="px-3 py-2">{cow.expectedCalvingDate}</td>
              <td className="px-3 py-2 font-medium text-indigo-700">{cow.bull}</td>
              <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${cow.diagnosisStatus === 'DG+' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {cow.diagnosisStatus}
                </span>
              </td>
              <td className="px-3 py-2">{cow.dryingDate}</td>
              <td className="px-3 py-2 text-gray-500">{cow.observations || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};