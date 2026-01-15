
export interface SpecializationData {
  name: string;
  trainersCount: number;
}

export interface DistributionResult {
  specAName: string;
  specBName: string;
  specATrainees: number;
  specBTrainees: number;
  specAPercentage: number;
  specBPercentage: number;
  totalTrainers: number;
  totalTrainees: number;
  ratioA: number;
  ratioB: number;
}

export interface GeminiAdvice {
  summary: string;
  recommendations: string[];
  efficiencyScore: number;
}
