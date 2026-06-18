import { apiClient } from './client';
import { MatchResult, Scholarship } from '../types';

export const getMatches = async (): Promise<MatchResult[]> => {
  const { data } = await apiClient.get<MatchResult[]>('/scholarships/matches');
  return data;
};

export const getSavedScholarships = async (): Promise<Scholarship[]> => {
  const { data } = await apiClient.get<Scholarship[]>('/scholarships/saved');
  return data;
};

export const saveScholarship = async (scholarshipId: string): Promise<void> => {
  await apiClient.post(`/scholarships/${scholarshipId}/save`);
};

export const unsaveScholarship = async (scholarshipId: string): Promise<void> => {
  await apiClient.delete(`/scholarships/${scholarshipId}/unsave`);
};
