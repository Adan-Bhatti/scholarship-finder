import { apiClient } from './client';

export interface DashboardStats {
  total_matches: number;
  saved_count: number;
  expiring_soon_count: number;
  total_funding_potential: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
  return data;
};
