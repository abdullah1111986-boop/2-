
export interface SpecializationData {
  id: string;
  name: string;
  trainersCount: number;
}

export interface SpecializationResult {
  id: string;
  name: string;
  traineesCount: number;
  percentage: number;
  trainersCount: number;
}

export interface DistributionResult {
  specs: SpecializationResult[];
  totalTrainers: number;
  totalTrainees: number;
  averageRatio: number;
}

export interface GeminiAdvice {
  summary: string;
  recommendations: string[];
  efficiencyScore: number;
}
