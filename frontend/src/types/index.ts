export interface Profile {
  id: string;
  user_id: string;
  degree_level?: string;
  field_of_study?: string;
  gpa?: number;
  nationality?: string;
  country_of_residence?: string;
  gender?: string;
  disability?: string;
  income_bracket?: string;
  extracurriculars?: string[];
  target_destinations?: string[];
  graduation_year?: number;
  updated_at: string;
}

export type ProfileCreate = Omit<Profile, 'id' | 'user_id' | 'updated_at'>;
export type ProfileUpdate = Partial<ProfileCreate>;

export interface User {
  id: string;
  email: string;
  created_at: string;
}
