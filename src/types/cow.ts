export interface InseminationRecord {
  lastInseminationDate: string;
  bull: string;
  inseminationNumber: number;
  firstInseminationDate?: string;
  firstHeatDate?: string;
}

export interface CalvingRecord {
  currentCalvingDate: string;
  previousCalvingDate: string;
}

export interface Cow {
  id: number;
  order: number;
  numberTag: string;
  name: string;
  situation: string;
  categoryGS: string;
  offspringCount: number;
  gender: string;
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
  diagnosisStatus: string;
  dryingDate: string;
  observations: string;
  inseminationHistory?: InseminationRecord[];
  calvingHistory?: CalvingRecord[];
}