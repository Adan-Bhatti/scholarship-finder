import { apiClient } from './client';
import type { Scholarship, MatchResult, SavedScholarship, ApplicationStatus } from '../types';

export const getMatches = async (): Promise<MatchResult[]> => {
  const { data } = await apiClient.get<MatchResult[]>('/scholarships/matches');
  return data;
};

export const getSavedScholarships = async (): Promise<SavedScholarship[]> => {
  const { data } = await apiClient.get<SavedScholarship[]>('/scholarships/saved');
  return data;
};

export const saveScholarship = async (scholarshipId: string): Promise<void> => {
  await apiClient.post(`/scholarships/${scholarshipId}/save`);
};

export const unsaveScholarship = async (scholarshipId: string): Promise<void> => {
  await apiClient.delete(`/scholarships/${scholarshipId}/unsave`);
};

export const updateSavedStatus = async (scholarshipId: string, status: ApplicationStatus, notes?: string): Promise<SavedScholarship> => {
  const payload: any = { status };
  if (notes !== undefined) {
    payload.notes = notes;
  }
  const { data } = await apiClient.patch<SavedScholarship>(`/scholarships/${scholarshipId}/saved`, payload);
  return data;
};
