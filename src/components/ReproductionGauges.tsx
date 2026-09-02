import type { Cow } from '../types/cow';

interface ReproductionGaugesProps {
  cows: Cow[];
}

export function ReproductionGauges({ cows }: ReproductionGaugesProps) {
  const totalCows = cows.length;

  if (totalCows === 0) {
    return null;
  }

  // Varre absolutamente TODAS as propriedades de cada vaca em busca de "PEV"
  const isCowPEV = (cow: any) => {
    if (!cow) return false;
    return Object.values(cow).some(val => {
      if (typeof val === 'string' && val.trim().toUpperCase() === 'PEV') {
        return true;
      }
      // Se houver algum objeto aninhado ou histórico que contenha PEV
      if (Array.isArray(val)) {
        return val.some(item => 
          typeof item === 'object' && item !== null && Object.values(item).some(subVal => typeof subVal === 'string' && subVal.trim().toUpperCase() === 'PEV')
        );
      }
      return false;
    });
  };

  // 1. Total de vacas aptas (excluindo vacas com status PEV em qualquer propriedade)
  const eligibleCows = cows.filter(cow => !isCowPEV(cow));
  const totalEligible = eligibleCows.length;

  // 2. Filtrar vacas aptas que foram inseminadas no ciclo atual 
  const cowsInseminatedCurrentCycle = eligibleCows.filter(cow => {
    const history = (cow.inseminationHistory || []) as any[];
    
    if (history.length === 0) {
      if (cow.lastInseminationDate && cow.lastInseminationDate.trim() !== '' && cow.lastInseminationDate.trim() !== '-') {
        if (!cow.currentCalvingDate) return true;
        return new Date(cow.lastInseminationDate) > new Date(cow.currentCalvingDate);
      }
      return false;
    }

    const activeInsems = history.filter((item: any) => !item.isCalvingRecord);
    if (activeInsems.length === 0) return false;

    const latestInsemination = activeInsems[0];
    const insemDate = latestInsemination.date || latestInsemination.lastInseminationDate;

    if (!cow.currentCalvingDate) return true;

    return new Date(insemDate) > new Date(cow.currentCalvingDate);
  });

  const servicedCount = cowsInseminatedCurrentCycle.length;
  const serviceRate = totalEligible > 0 ? (servicedCount / totalEligible) * 100 : 0;

  // 3. Identifica se a vaca está prenhe no ciclo atual de forma rigorosa
  const isCowPregnantCurrentCycle = (cow: any) => {
    if (isCowPEV(cow)) return false;

    const rawDg = cow.diagnosisStatus || cow.diagnosis || cow.dg || '';
    const hasPositiveDG = typeof rawDg === 'string' && (rawDg.toUpperCase().includes('DG+') || rawDg.toUpperCase().includes('PRENHE'));
    
    const history = (cow.inseminationHistory || []) as any[];
    
    if (history.length > 0) {
      const activeInsems = history.filter((item: any) => !item.isCalvingRecord);
      if (activeInsems.length > 0) {
        const latest = activeInsems[0];
        const insemDate = latest.date || latest.lastInseminationDate;
        
        const isCurrentCycle = !cow.currentCalvingDate || (insemDate && new Date(insemDate) > new Date(cow.currentCalvingDate));

        const latestStatus = latest.successStatus || latest.status || '';
        const isLatestPositive = typeof latestStatus === 'string' && (latestStatus.toUpperCase().includes('PRENHE') || latestStatus.toUpperCase().includes('DG+'));

        if (isCurrentCycle && isLatestPositive) {
          return true;
        }
      }
    }

    return hasPositiveDG;
  };

  const pregnantCowsList = eligibleCows.filter(cow => isCowPregnantCurrentCycle(cow));
  const pregnantCount = pregnantCowsList.length;

  // 4. Taxa de Concepção: (Vacas Prenhes no ciclo ÷ Vacas Servidas no ciclo) * 100
  const conceptionRate = servicedCount > 0 ? (pregnantCount / servicedCount) * 100 : 0;

  // 5. Taxa de Prenhez: (Vacas Prenhes no ciclo ÷ Total Geral de Vacas Aptas) * 100
  const pregnancyRate = totalEligible > 0 ? (pregnantCount / totalEligible) * 100 : 0;

  // Sub-componente do medidor visual
  const GaugeCard = ({ title, percentage }: { title: string; percentage: number }) => {
    const radius = 40;
    const circumference = Math.PI * radius;
    const strokeDashoffset = circumference - (Math.min(percentage, 100) / 100) * circumference;

    return (
      <div className="bg-white p-5 rounded-lg shadow border border-gray-100 flex flex-col items-center justify-between">
        <div className="flex justify-between w-full items-center mb-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            {title}
          </h3>
        </div>

        {/* Gráfico Semicircular SVG */}
        <div className="relative w-40 h-24 flex items-end justify-center my-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60">
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#dc2626"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
            />
          </svg>
          <div className="absolute bottom-1 text-xl font-extrabold text-gray-800">
            {percentage.toFixed(1)}%
          </div>
        </div>

        <div className="flex justify-between w-full text-xs text-gray-400 px-2 mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <GaugeCard title="Taxa de Serviço" percentage={serviceRate} />
      <GaugeCard title="Taxa de Concepção" percentage={conceptionRate} />
      <GaugeCard title="Taxa de Prenhez" percentage={pregnancyRate} />
    </div>
  );
}