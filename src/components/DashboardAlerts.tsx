import type { Cow } from "../types/cow";

interface DashboardAlertsProps {
  cows: Cow[];
}

export function DashboardAlerts({ cows }: DashboardAlertsProps) {
  const today = new Date();

  // Helper para calcular dias entre hoje e uma data alvo (considerando dias decorridos desde a data passada)
  const getDaysSince = (dateString?: string | null) => {
    if (!dateString) return null;
    const targetDate = new Date(dateString);
    const diffTime = today.getTime() - targetDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper para calcular dias entre hoje e uma data futura (para partos)
  const getDaysDifference = (dateString?: string | null) => {
    if (!dateString) return null;
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper para verificar se o último histórico de IA é positivo (DG+)
  const isLatestInseminationPositive = (cow: Cow) => {
    if (!cow.inseminationHistory || cow.inseminationHistory.length === 0) {
      return false;
    }
    const latest = cow.inseminationHistory[0];
    const status = latest.successStatus;
    return status === 'Prenhe / Sucesso' || status === 'DG+';
  };

  // 1. Partos Previstos para os próximos 30 dias (somente se o último histórico for DG+)
  const upcomingCalvings = cows.filter((cow) => {
    if (!isLatestInseminationPositive(cow)) return false;
    const diff = getDaysDifference(cow.expectedCalvingDate);
    return diff !== null && diff >= -5 && diff <= 30;
  });

  // 2. Acompanhamento de IA / DG: Apenas DG- ou Pendente com mais de 28 dias da IA
  const pendingDGs = cows.filter(cow => {
    const lastInsemDate = cow.lastInseminationDate || (cow.inseminationHistory && cow.inseminationHistory[0]?.date);
    const hasInsemination = Boolean(lastInsemDate);
    if (!hasInsemination) return false;

    // Replica a mesma lógica de cálculo de status de DG usada nas outras telas
    let dgStatus = 'Pendente';
    if (cow.inseminationHistory && cow.inseminationHistory.length > 0) {
      const latest = cow.inseminationHistory[0];
      const status = latest.successStatus;
      if (status === 'Prenhe / Sucesso' || status === 'DG+') dgStatus = 'DG+';
      else if (status === 'Vazia / Falha' || status === 'DG-') dgStatus = 'DG-';
      else if (status === 'PEV') dgStatus = 'PEV';
    }

    // O animal precisa ter status Pendente ou DG-
    const isEligibleStatus = dgStatus === 'Pendente' || dgStatus === 'DG-';
    if (!isEligibleStatus) return false;

    // E a IA deve ter sido feita há mais de 28 dias
    const daysSinceInsem = getDaysSince(lastInsemDate);
    const isMoreThan28Days = daysSinceInsem !== null && daysSinceInsem > 28;

    return isMoreThan28Days;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Card de Alerta: Próximos Partos */}
      <div className="bg-white p-4 rounded-lg shadow border-t-4 border-amber-500">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <span>🚨 Próximos Partos (30 dias)</span>
          </h3>
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {upcomingCalvings.length} animais
          </span>
        </div>

        {upcomingCalvings.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">
            Nenhum parto previsto para os próximos dias.
          </p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {upcomingCalvings.map((cow) => {
              const diff = getDaysDifference(cow.expectedCalvingDate);
              return (
                <div
                  key={cow.id}
                  className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded border"
                >
                  <div>
                    <span className="font-bold text-gray-800">
                      Brinco {cow.numberTag || "S/N"}
                    </span>{" "}
                    - {cow.name}
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-amber-700">
                      Previsto: {cow.expectedCalvingDate}
                    </span>
                    <span className="block text-[10px] text-gray-400">
                      {diff !== null && diff === 0
                        ? "É hoje!"
                        : diff !== null && diff < 0
                          ? `Passou ${Math.abs(diff)} dias`
                          : `Faltam ${diff} dias`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card de Alerta: Atenção Reprodutiva / Coberturas */}
      <div className="bg-white p-4 rounded-lg shadow border-t-4 border-blue-500">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <span>🔍 Acompanhamento de IA / DG</span>
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {pendingDGs.length} animais
          </span>
        </div>

        {pendingDGs.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">
            Nenhum animal pendente de revisão recente.
          </p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {pendingDGs.map((cow) => {
              const lastInsemDate = cow.lastInseminationDate || (cow.inseminationHistory && cow.inseminationHistory[0]?.date);
              const days = getDaysSince(lastInsemDate);
              return (
                <div
                  key={cow.id}
                  className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded border"
                >
                  <div>
                    <span className="font-bold text-gray-800">
                      Brinco {cow.numberTag || "S/N"}
                    </span>{" "}
                    - {cow.name}
                  </div>
                  <div className="text-right">
                    <span className="text-gray-600">
                      Últ. IA: {lastInsemDate || "N/D"} ({days} dias)
                    </span>
                    <span className="block text-[10px] font-semibold text-blue-600">
                      IA nº {cow.inseminationNumber || 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}