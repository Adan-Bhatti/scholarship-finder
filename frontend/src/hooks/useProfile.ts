import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import { Profile, ProfileCreate, ProfileUpdate } from '../types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get<Profile>('/profile');
      setProfile(data);
      setError(null);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        setError(err.message || 'Failed to fetch profile');
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const createProfile = async (profileData: ProfileCreate) => {
    const { data } = await apiClient.post<Profile>('/profile', profileData);
    setProfile(data);
    return data;
  };

  const updateProfile = async (profileData: ProfileUpdate) => {
    const { data } = await apiClient.patch<Profile>('/profile', profileData);
    setProfile(data);
    return data;
  };

  return { profile, loading, error, createProfile, updateProfile, fetchProfile };
}
