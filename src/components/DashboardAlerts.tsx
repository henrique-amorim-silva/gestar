import type { Cow } from "../types/cow";

interface DashboardAlertsProps {
  cows: Cow[];
}

export function DashboardAlerts({ cows }: DashboardAlertsProps) {
  const today = new Date();

  // Helper para calcular dias entre hoje e uma data alvo
  const getDaysDifference = (dateString: string) => {
    if (!dateString) return null;
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 1. Partos Previstos para os próximos 30 dias (e que não passaram há mais de 5 dias)
  const upcomingCalvings = cows.filter((cow) => {
    const diff = getDaysDifference(cow.expectedCalvingDate);
    return diff !== null && diff >= -5 && diff <= 30;
  });

  const pendingDGs = cows.filter(cow => {
    const hasInsemination = Boolean(cow.lastInseminationDate) || (cow.inseminationHistory && cow.inseminationHistory.length > 0);
    if (!hasInsemination) return false;

    // Replica a mesma lógica de cálculo de status de DG usada na tabela
    let dgStatus = 'Pendente';
    if (cow.inseminationHistory && cow.inseminationHistory.length > 0) {
      const latest = cow.inseminationHistory[0];
      const status = latest.successStatus;
      if (status === 'Prenhe / Sucesso' || status === 'DG+') dgStatus = 'DG+';
      else if (status === 'Vazia / Falha' || status === 'DG-') dgStatus = 'DG-';
    }

    // O animal só fica pendente no painel se o status for 'Pendente' ou 'DG-'
    // Se virou 'DG+', ele some automaticamente do acompanhamento de IA/DG
    return dgStatus === 'Pendente' || dgStatus === 'DG-';
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
            {pendingDGs.map((cow) => (
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
                    Últ. IA: {cow.lastInseminationDate || "N/D"}
                  </span>
                  <span className="block text-[10px] font-semibold text-blue-600">
                    IA nº {cow.inseminationNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
