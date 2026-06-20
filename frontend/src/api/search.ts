import { apiClient } from './client';
import type { Scholarship } from '../types';

export interface SearchParams {
  q?: string;
  degree?: string;
  country?: string;
  min_amount?: number;
  max_amount?: number;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  total: number;
  page: number;
  limit: number;
  data: Scholarship[];
}

export const searchScholarships = async (params: SearchParams): Promise<SearchResponse> => {
  const { data } = await apiClient.get<SearchResponse>('/scholarships/search', {
    params,
  });
  return data;
};
