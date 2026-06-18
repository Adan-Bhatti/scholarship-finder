import { apiClient } from './client';

export interface AIExplanation {
  explanation: string;
  checklist: string[];
}

export const getScholarshipExplanation = async (scholarshipId: string): Promise<AIExplanation> => {
  const { data } = await apiClient.get<AIExplanation>(`/match/explain/${scholarshipId}`);
  return data;
};
