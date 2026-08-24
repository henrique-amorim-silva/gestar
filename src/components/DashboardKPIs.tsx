import type { Cow } from '../types/cow';

interface DashboardKPIsProps {
  cows: Cow[];
}

export function DashboardKPIs({ cows }: DashboardKPIsProps) {
  const totalCows = cows.length;
  
  if (totalCows === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6 text-center text-gray-500">
        Nenhum animal cadastrado para calcular os indicadores.
      </div>
    );
  }

  // 1. Média de DEL (Dias em Lactação)
  const totalDel = cows.reduce((acc, cow) => acc + (cow.del || 0), 0);
  const avgDel = Math.round(totalDel / totalCows);

  // 2. Média de IP (Intervalo entre Partos)
  const totalIp = cows.reduce((acc, cow) => acc + (cow.ip || 0), 0);
  const avgIp = totalIp > 0 ? (totalIp / cows.filter(c => c.ip > 0).length || 1).toFixed(1) : '0';

  // 3. Contagem de DG+ (Prenhes) - Varredura flexível e abrangente
  const totalPregnant = cows.filter(cow => {
    const status = (
      cow.diagnosisStatus || 
      (cow as any).diagnosis || 
      (cow as any).status || 
      ''
    ).toString().trim().toUpperCase();

    const isDirectPositive = status === 'DG+' || status === 'PRENHE' || status === 'POSITIVO' || status === 'DG +';

    const hasHistoryPositive = cow.inseminationHistory && cow.inseminationHistory.length > 0 && (
      cow.inseminationHistory[0].successStatus === 'Prenhe / Sucesso' ||
      cow.inseminationHistory[0].successStatus === 'DG+' ||
      (cow.inseminationHistory[0] as any).status === 'DG+'
    );

    return isDirectPositive || hasHistoryPositive;
  }).length;
  
  const pregnancyRate = totalCows > 0 ? Math.round((totalPregnant / totalCows) * 100) : 0;

  // 4. Vacas em Lactação (L) vs Secas (S)
  const lactatingCount = cows.filter(cow => cow.situation === 'L').length;
  const dryCount = cows.filter(cow => cow.situation === 'S').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: DEL Médio */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-emerald-600">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">DEL Médio</span>
        <div className="flex items-baseline mt-1">
          <span className="text-2xl font-bold text-gray-800">{avgDel}</span>
          <span className="ml-1 text-sm text-gray-500">dias</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Dias em lactação atual</p>
      </div>

      {/* Card 2: IP Médio */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-600">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Médio (Intervalo Partos)</span>
        <div className="flex items-baseline mt-1">
          <span className="text-2xl font-bold text-gray-800">{avgIp}</span>
          <span className="ml-1 text-sm text-gray-500">meses / anos</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Média histórica do rebanho</p>
      </div>

      {/* Card 3: Taxa de Prenhez (DG+) */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-amber-500">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Diagnósticos DG+</span>
        <div className="flex items-baseline mt-1">
          <span className="text-2xl font-bold text-gray-800">{totalPregnant}</span>
          <span className="ml-1 text-sm text-gray-500">({pregnancyRate}%)</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Animais confirmados prenhes</p>
      </div>

      {/* Card 4: Situação do Rebanho */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-600">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Situação Atual</span>
        <div className="flex items-baseline mt-1 space-x-2">
          <span className="text-lg font-bold text-gray-800">{lactatingCount} <span className="text-xs font-normal text-gray-500">Lactação</span></span>
          <span className="text-lg font-bold text-gray-400">/</span>
          <span className="text-lg font-bold text-gray-800">{dryCount} <span className="text-xs font-normal text-gray-500">Secas</span></span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Total de animais: {totalCows}</p>
      </div>
    </div>
  );
}