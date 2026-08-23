import type { Cow } from '../types/cow';

interface GeneralSituationProps {
  cows: Cow[];
}

export function GeneralSituationDashboard({ cows }: GeneralSituationProps) {
  const totalCows = cows.length;

  if (totalCows === 0) {
    return null;
  }

  // Conta quantas vacas estão em lactação ('L')
  const lactatingCount = cows.filter(cow => cow.situation === 'L').length;

  // Calcula a porcentagem
  const lactatingPercentage = Math.round((lactatingCount / totalCows) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card: Total de Vacas */}
      <div className="bg-white p-5 rounded-lg shadow border-l-4 border-emerald-600 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total do Rebanho</span>
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-bold text-gray-800">{totalCows}</span>
            <span className="ml-1 text-sm text-gray-500">animais</span>
          </div>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-full">
          {/* Ícone opcional ou div decorativa */}
          <span className="text-xl font-bold">🐄</span>
        </div>
      </div>

      {/* Card: Porcentagem em Lactação */}
      <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-600 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vacas em Lactação</span>
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-bold text-gray-800">{lactatingPercentage}%</span>
            <span className="ml-1 text-sm text-gray-500">({lactatingCount} de {totalCows})</span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 text-blue-700 rounded-full">
          <span className="text-xl font-bold">🥛</span>
        </div>
      </div>
    </div>
  );
}