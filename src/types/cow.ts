export interface InseminationRecord {
  lastInseminationDate: string;
  bull: string;
  inseminationNumber: number;
}

export interface Cow {
  id: number;
  order: number;
  numberTag: string;
  name: string;
  situation: 'L' | 'S';
  categoryGS: string;
  offspringCount: number;
  gender: 'F' | 'M' | 'MF';
  currentCalvingDate: string;
  previousCalvingDate: string;
  firstHeatDate: string;
  firstInseminationDate: string;
  lastHeatDate: string;
  lastInseminationDate: string;
  inseminationNumber: number;
  heatsCount: number;
  del: number;
  ps: number;
  dpia: number;
  ip: number;
  expectedIp: number;
  expectedCalvingDate: string;
  bull: string;
  diagnosisStatus: 'DG+' | 'DG-';
  dryingDate: string;
  observations: string;
  inseminationHistory?: InseminationRecord[];
}