export function calculateReproductionFields(data: {
  currentCalvingDate: string;
  previousCalvingDate?: string;
  lastInseminationDate?: string;
  inseminationNumber: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Função auxiliar para diferença em dias (Data Final - Data Inicial)
  const getDaysBetween = (startDateStr: string, endDateStr: string) => {
    if (!startDateStr || !endDateStr) return 0;
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');
    const diffTime = end.getTime() - start.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // 1. DEL: Dias entre o Parto Atual e Hoje
  const del = data.currentCalvingDate ? Math.max(0, getDaysBetween(data.currentCalvingDate, today.toISOString().split('T')[0])) : 0;

  // 2. PS: Dias do Parto Atual até a Última IA
  const ps = (data.currentCalvingDate && data.lastInseminationDate) 
    ? Math.max(0, getDaysBetween(data.currentCalvingDate, data.lastInseminationDate)) 
    : 0;

  // 3. DPIA: Dias Pós-Inseminação (Dias desde a Última IA até hoje)
  const dpia = data.lastInseminationDate 
    ? Math.max(0, getDaysBetween(data.lastInseminationDate, today.toISOString().split('T')[0])) 
    : 0;

  // 4. Previsão de Parto (Última IA + 283 dias de gestação média)
  let expectedCalvingDate = '';
  if (data.lastInseminationDate) {
    const lastInsem = new Date(data.lastInseminationDate + 'T00:00:00');
    lastInsem.setDate(lastInsem.getDate() + 283);
    expectedCalvingDate = lastInsem.toISOString().split('T')[0];
  }

  // 5. IP (Intervalo de Partos) em meses: (Parto Atual - Parto Ant.) / 30.416
  let ip = 0;
  if (data.previousCalvingDate && data.currentCalvingDate) {
    const diffDays = getDaysBetween(data.previousCalvingDate, data.currentCalvingDate);
    ip = Number((diffDays / 30.416).toFixed(1));
  }

  // 6. IP Previsto em meses: (Previsão de Parto - Parto Atual) / 30.416
  let expectedIp = 0;
  if (data.currentCalvingDate && expectedCalvingDate) {
    const diffDays = getDaysBetween(data.currentCalvingDate, expectedCalvingDate);
    expectedIp = Number((diffDays / 30.416).toFixed(1));
  }

  return {
    del,
    ps,
    dpia,
    ip: Math.max(0, ip),
    expectedIp: Math.max(0, expectedIp),
    expectedCalvingDate,
    heatsCount: data.inseminationNumber
  };
}