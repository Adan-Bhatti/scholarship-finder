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
  },

  getPublicProfile: async (id: string): Promise<Profile> => {
    const response = await apiClient.get(`/profile/public/${id}`);
    return response.data;
  },

  uploadResume: async (file: File): Promise<Profile> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/profile/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
