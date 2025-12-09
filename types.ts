export interface ScanUrl {
  id: string;
  url: string;
  username?: string;
  password?: string;
}

export interface SavedUrlSet {
  id: string;
  name: string;
  urls: ScanUrl[];
  createdAt: string;
}

export enum WcagLevel {
  A = 'A',
  AA = 'AA',
}

export enum WcagResult {
  PASS = 'Voldoet',
  FAIL = 'Voldoet niet',
  NOT_APPLICABLE = 'Niet van toepassing',
}

export interface Finding {
  description: string;
  location: string;
  technicalDetails: string;
  solution: string;
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  level: WcagLevel;
  result: WcagResult;
  findings: Finding[];
}

export interface Principle {
  id: string;
  name: string;
  description: string;
  criteria: Criterion[];
}

export interface Score {
  passed: number;
  total: number;
}

export interface ReportSummary {
  wcag21: {
    levelA: Score;
    levelAA: Score;
    total: Score;
  };
  wcag22: {
    levelA: Score;
    levelAA: Score;
    total: Score;
  };
}

export interface ReportData {
  meta: {
    client: string;
    website: string;
    date: string;
    version: string;
    inspector: string;
  };
  summary: ReportSummary;
  principles: Principle[];
  executiveSummary: string;
}