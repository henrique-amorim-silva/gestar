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

  // Condições de meta
  const isGoodTotal = totalCows >= 43;
  const isGoodLactating = lactatingPercentage >= 83;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Card: Total de Vacas */}
      <div className={`p-5 rounded-xl shadow-md border-2 transition-all ${
        isGoodTotal 
          ? 'bg-emerald-50/80 border-emerald-500 shadow-emerald-100' 
          : 'bg-white border-gray-200'
      } flex items-center justify-between`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Total do Rebanho</span>
            {isGoodTotal && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm animate-pulse">
                ⭐ META ATINGIDA
              </span>
            )}
          </div>
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-extrabold text-gray-900">{totalCows}</span>
            <span className="ml-1 text-sm font-medium text-gray-600">animais</span>
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${isGoodTotal ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-gray-700'}`}>
          <span className="text-2xl">🐄</span>
        </div>
      </div>

      {/* Card: Porcentagem em Lactação */}
      <div className={`p-5 rounded-xl shadow-md border-2 transition-all ${
        isGoodLactating 
          ? 'bg-emerald-50/80 border-emerald-500 shadow-emerald-100' 
          : 'bg-white border-gray-200'
      } flex items-center justify-between`}>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Vacas em Lactação</span>
            {isGoodLactating && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-sm animate-pulse">
                ⭐ EXCELENTE
              </span>
            )}
          </div>
          <div className="flex items-baseline mt-1">
            <span className="text-3xl font-extrabold text-gray-900">{lactatingPercentage}%</span>
            <span className="ml-1 text-sm font-medium text-gray-600">({lactatingCount} de {totalCows})</span>
          </div>
        </div>
        <div className={`p-3 rounded-2xl ${isGoodLactating ? 'bg-emerald-600 text-white shadow-md' : 'bg-blue-50 text-blue-700'}`}>
          <span className="text-2xl">🥛</span>
        </div>
      </div>
    </div>
  );
}