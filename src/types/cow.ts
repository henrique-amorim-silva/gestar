export interface Cow {
  id: number;
  order: number;
  numberTag: string; // Num.
  name: string; // Vacas
  situation: 'L' | 'S'; // L = Lactação, S = Seca / Descarte
  categoryGS: string; // G.S.
  offspringCount: number; // Crias
  gender: 'F' | 'M' | 'MF'; // Sexo
  currentCalvingDate: string; // Parto Atual
  previousCalvingDate: string; // Parto Ant.
  firstHeatDate: string; // 1o. Cio
  firstInseminationDate: string; // 1a. IA
  lastHeatDate: string; // Ult. Cio
  lastInseminationDate: string; // Ult. IA
  inseminationNumber: number; // No.IA
  heatsCount: number; // Cios
  del: number; // DEL (Dias em Lactação)
  ps: number; // PS
  dpia: number; // DPIA
  ip: number; // IP (Intervalo de Partos)
  expectedIp: number; // IP Prev.
  expectedCalvingDate: string; // Prev. Parto
  bull: string; // Touro
  diagnosisStatus: 'DG+' | 'DG-'; // Sit. (DG+ / DG-)
  dryingDate: string; // Secar
  observations: string; // Observações
}