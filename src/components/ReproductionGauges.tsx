import type { Cow } from '../types/cow';

interface ReproductionGaugesProps {
  cows: Cow[];
}

export function ReproductionGauges({ cows }: ReproductionGaugesProps) {
  const totalCows = cows.length;

  if (totalCows === 0) {
    return null;
  }

  // Cálculos das métricas
  const servicedCows = cows.filter(cow => (cow.inseminationNumber && cow.inseminationNumber > 0) || cow.lastInseminationDate).length;
  const serviceRate = totalCows > 0 ? (servicedCows / totalCows) * 100 : 0;

  const pregnantCount = cows.filter(cow => cow.diagnosisStatus === 'DG+').length;
  const conceptionRate = servicedCows > 0 ? (pregnantCount / servicedCows) * 100 : 0;

  const pregnancyRate = (pregnantCount / totalCows) * 100;

  // Sub-componente do medidor no mesmo padrão dos outros blocos do dashboard
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
          <svg className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>

        {/* Gráfico Semicircular SVG */}
        <div className="relative w-40 h-24 flex items-end justify-center my-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 60">
            {/* Trilha de fundo cinza clara */}
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Arco vermelho de preenchimento */}
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

        {/* Eixo numérico inferior 0 a 100 */}
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