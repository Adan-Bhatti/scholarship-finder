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

export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount_min?: number;
  amount_max?: number;
  currency?: string;
  deadline?: string;
  renewable?: boolean;
  degree_levels?: string[];
  fields_of_study?: string[];
  eligible_nationalities?: string[];
  eligible_countries?: string[];
  gpa_requirement?: number;
  income_requirement?: string;
  description?: string;
  eligibility_text?: string;
  requirements?: string[];
  benefits?: string[];
  application_url?: string;
  source_url?: string;
  source_name?: string;
  created_at: string;
  last_scraped_at?: string;
}

export interface MatchResult {
  scholarship: Scholarship;
  match_score: number;
}
