import { apiClient } from './client';
import { Profile } from '../types';

export const profileApi = {
  getProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/profile');
    return response.data;
  },
  
  createProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await apiClient.post('/profile', data);
    return response.data;
  },

  updateProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await apiClient.patch('/profile', data);
    return response.data;
  }
};
