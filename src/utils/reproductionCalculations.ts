export function calculateReproductionFields(data: {
  currentCalvingDate: string;
  previousCalvingDate?: string;
  lastInseminationDate?: string;
  firstInseminationDate?: string;
  firstHeatDate?: string;
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

  const del = data.currentCalvingDate ? Math.max(0, getDaysBetween(data.currentCalvingDate, today.toISOString().split('T')[0])) : 0;
  const ps = (data.currentCalvingDate && data.lastInseminationDate) ? Math.max(0, getDaysBetween(data.currentCalvingDate, data.lastInseminationDate)) : 0;
  const dpia = data.lastInseminationDate ? Math.max(0, getDaysBetween(data.lastInseminationDate, today.toISOString().split('T')[0])) : 0;

  let expectedCalvingDate = '';
  if (data.lastInseminationDate) {
    const lastInsem = new Date(data.lastInseminationDate + 'T00:00:00');
    lastInsem.setDate(lastInsem.getDate() + 280);
    expectedCalvingDate = lastInsem.toISOString().split('T')[0];
  }

  let dryingDate = '';
  if (expectedCalvingDate) {
    const calving = new Date(expectedCalvingDate + 'T00:00:00');
    calving.setDate(calving.getDate() - 60);
    dryingDate = calving.toISOString().split('T')[0];
  }

  const ip = (data.previousCalvingDate && data.currentCalvingDate) 
    ? Number((getDaysBetween(data.previousCalvingDate, data.currentCalvingDate) / 30.416).toFixed(1)) : 0;
  
  const expectedIp = (data.currentCalvingDate && expectedCalvingDate) 
    ? Number((getDaysBetween(data.currentCalvingDate, expectedCalvingDate) / 30.416).toFixed(1)) : 0;

  const firstDate = data.firstInseminationDate || data.firstHeatDate || '';
  const lastDate = data.lastInseminationDate || '';

  return {
    del,
    ps,
    dpia,
    ip: Math.max(0, ip),
    expectedIp: Math.max(0, expectedIp),
    expectedCalvingDate,
    dryingDate,
    heatsCount: data.inseminationNumber,
    firstHeatDate: firstDate,
    firstInseminationDate: firstDate,
    lastHeatDate: lastDate,
    lastInseminationDate: lastDate,
  };
}