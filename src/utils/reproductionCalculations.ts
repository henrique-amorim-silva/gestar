export function calculateReproductionFields(data: {
  currentCalvingDate: string;
  previousCalvingDate?: string;
  lastInseminationDate?: string; // Atualizado pelo fluxo de +IA
  firstInseminationDate?: string; // Manual (Legado)
  firstHeatDate?: string;         // Manual (Legado)
  inseminationNumber: number;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysBetween = (startDateStr: string, endDateStr: string) => {
    if (!startDateStr || !endDateStr) return 0;
    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T00:00:00');
    const diffTime = end.getTime() - start.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Cálculos básicos
  const del = data.currentCalvingDate ? Math.max(0, getDaysBetween(data.currentCalvingDate, today.toISOString().split('T')[0])) : 0;
  const ps = (data.currentCalvingDate && data.lastInseminationDate) ? Math.max(0, getDaysBetween(data.currentCalvingDate, data.lastInseminationDate)) : 0;
  const dpia = data.lastInseminationDate ? Math.max(0, getDaysBetween(data.lastInseminationDate, today.toISOString().split('T')[0])) : 0;

  // Previsão de Parto (280 dias)
  let expectedCalvingDate = '';
  if (data.lastInseminationDate) {
    const lastInsem = new Date(data.lastInseminationDate + 'T00:00:00');
    lastInsem.setDate(lastInsem.getDate() + 280);
    expectedCalvingDate = lastInsem.toISOString().split('T')[0];
  }

  // Data de Secar (60 dias antes da Previsão de Parto)
  let dryingDate = '';
  if (expectedCalvingDate) {
    const calving = new Date(expectedCalvingDate + 'T00:00:00');
    calving.setDate(calving.getDate() - 60);
    dryingDate = calving.toISOString().split('T')[0];
  }

  // Intervalos em meses
  const ip = (data.previousCalvingDate && data.currentCalvingDate) 
    ? Number((getDaysBetween(data.previousCalvingDate, data.currentCalvingDate) / 30.416).toFixed(1)) : 0;
  
  const expectedIp = (data.currentCalvingDate && expectedCalvingDate) 
    ? Number((getDaysBetween(data.currentCalvingDate, expectedCalvingDate) / 30.416).toFixed(1)) : 0;

  return {
    del,
    ps,
    dpia,
    ip: Math.max(0, ip),
    expectedIp: Math.max(0, expectedIp),
    expectedCalvingDate,
    dryingDate, // <--- Adicionado o campo de secar calculado
    heatsCount: data.inseminationNumber,
    firstHeatDate: data.firstHeatDate || data.firstInseminationDate || '',
    firstInseminationDate: data.firstInseminationDate || '',
    lastHeatDate: data.lastInseminationDate || ''
  };
}